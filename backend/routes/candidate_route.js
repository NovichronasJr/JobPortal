
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Candidate = require('../database/models/candidate_model');
const Job = require('../database/models/job_model');
const Application = require('../database/models/application_model');
const Interview = require('../database/models/interview_model');
const Notification = require('../database/models/notification_model');
const upload = require('../configs/multer_config');
const { protect } = require('../middleware/middleware');
const { analyzeResumeSkills } = require('../services/llmservice'); // Your Mistral Logic

/**
 * @route   PUT /api/candidate/update-profile
 * @desc    Sync profile metadata (Bio, Skills, Slider Experience, Education) and handle assets
 * @access  Private
 */
router.put('/update-profile', protect, upload.fields([
    { name: 'profilephoto', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), async (req, res) => {
    try {
        const userId = req.user.id;
        const candidate = await Candidate.findOne({ user: userId });

        if (!candidate) return res.status(404).json({ message: "Candidate not found." });

        // --- 1. PREPARE METADATA ---
        const { bio, phone, address, skills, education, experienceYears } = req.body;
        
        let updateData = { bio, phone, address };

        // Handle Experience Years (Convert Slider String to Number)
        if (experienceYears !== undefined) {
            updateData.experienceYears = Number(experienceYears);
        }

        // Handle JSON Arrays (Skills & Education)
        try {
            if (skills) updateData.skills = JSON.parse(skills);
            if (education) updateData.education = JSON.parse(education);
        } catch (e) {
            console.error("JSON Parsing Error for arrays:", e.message);
            // Fallback: If parsing fails, we keep existing data or use raw if already array
            if (skills) updateData.skills = Array.isArray(skills) ? skills : updateData.skills;
            if (education) updateData.education = Array.isArray(education) ? education : updateData.education;
        }

        // --- 2. PHOTO LOGIC (REPLACE & PURGE) ---
        if (req.files && req.files['profilephoto']) {
            const newPhotoPath = `candidate/profilephoto/${req.files['profilephoto'][0].filename}`;

            if (candidate.profilePhoto && candidate.profilePhoto !== "default_pics/candidate.jpg") {
                const oldPath = path.resolve('public', candidate.profilePhoto);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); 
            }
            updateData.profilePhoto = newPhotoPath;
        }

        // --- 3. RESUME LOGIC (REPLACE, PURGE & AI BRAIN) ---
        if (req.files && req.files['resume']) {
            const newResumePath = `candidate/resume/${req.files['resume'][0].filename}`;

            if (candidate.resumeUrl) {
                const oldResumePath = path.resolve('public', candidate.resumeUrl);
                if (fs.existsSync(oldResumePath)) fs.unlinkSync(oldResumePath);
            }
            updateData.resumeUrl = newResumePath;

            // Trigger Day 6 AI Extraction (LangChain + Mistral)
            try {
                const extractedSkills = await analyzeResumeSkills(newResumePath);
                updateData.skills = extractedSkills; 
                updateData.isProfileComplete = true;
            } catch (aiError) {
                console.error("AI Skill Extraction Failed:", aiError.message);
                // Fallback: Keep profile update going even if AI fails
            }
        }

        // --- 4. EXECUTE ATOMIC UPDATE ---
        const updatedProfile = await Candidate.findOneAndUpdate(
            { user: userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Candidate Professional DNA synchronized.",
            profile: updatedProfile
        });

    } catch (error) {
        console.error("Critical Profile Update Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error during profile sync." 
        });
    }
});

// controllers/jobController.js or inside your routes file

router.get('/allJobs', protect, async (req, res) => {
    try {
        const all_jobs = await Job.find()
            .populate('recruiterId','organizationName organizationLogo') 
            .sort({ createdAt: -1 })
            .lean(); // Converts to plain JS objects for 2x faster performance

        // 4. Verification Check: Are there any jobs?
        if (!all_jobs || all_jobs.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "Marketplace is currently quiet.", 
                jobs: [] 
            });
        }

        // 5. Standardized Success Response for CandidateJobContext
        return res.status(200).json({
            success: true,
            count: all_jobs.length,
            jobs: all_jobs
        });

    } catch (error) {
        console.error("Critical Feed Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Neural Marketplace Sync Failed.", 
            error: error.message 
        });
    }
});

router.post('/applyJob', protect, async (req, res) => {
    try {
        // Taking candidateId from body as requested
        const { jobId, candidateId, aiScore } = req.body;

        if (!jobId || !candidateId) {
            return res.status(400).json({ success: false, message: "Sync Error: Node identifiers missing." });
        }

        // Initialize Application
        const newApplication = new Application({
            jobId,
            candidateId,
            aiScore: aiScore || 0,
            status: 'Applied'
        });

        await newApplication.save();

        res.status(201).json({
            success: true,
            message: "Application Synced Successfully.",
            application: newApplication
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Sync exists: Already applied." });
        }
        res.status(500).json({ success: false, message: "Neural Link Error", error: error.message });
    }
});

// GET: /api/applications/my-applications/:candidateId
router.get('/my-applications/:candidateId', protect, async (req, res) => {
    try {
        const { candidateId } = req.params;
        const userIdFromCookie = req.user.id;

        // --- THE SECURITY CHECK ---
        // Since we can't trust the URL alone, we check if the Candidate profile 
        // exists and is actually linked to the User ID from our secure cookie.
        // We assume your Candidate model has a field like 'userId'
        const candidateProfile = await Candidate.findOne({ 
            _id: candidateId, 
            user: userIdFromCookie 
        });

        if (!candidateProfile) {
            return res.status(403).json({ 
                success: false, 
                message: "Neural Mismatch: Unauthorized access to this candidate profile." 
            });
        }

        // --- FETCH THE APPLICATIONS ---
        const applications = await Application.find({ candidateId })
            .populate({
                path: 'jobId',
                select: 'title location stipend workModel workType recruiterId',
                populate: {
                    path: 'recruiterId',
                    select: 'organizationName organizationLogo'
                }
            })
            .sort({ appliedAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error("Retrieval Error:", error);
        res.status(500).json({ success: false, message: "Internal Sync Error", error: error.message });
    }
});


/**
 * @route   GET /api/candidate/my-interviews
 * @desc    Fetch all scheduled interviews for the logged-in candidate
 */
router.get('/my-interviews', protect,  async (req, res) => {
    try {
        // 1. Resolve Candidate Identity from the User ID in the cookie
        const candidateProfile = await Candidate.findOne({ user: req.user.id });
        
        if (!candidateProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "Candidate profile not found. Please complete your setup." 
            });
        }

        // 2. Fetch Interviews
        // We populate jobId and recruiterId to show the company and the person's name
        const interviews = await Interview.find({ 
            candidateId: candidateProfile._id 
        })
        .populate({
            path: 'jobId',
            select: 'title companyName' // Check if your Job model has companyName!
        })
        .populate({
            path: 'recruiterId',
            select: 'firstName lastName profilePhoto'
        })
        .sort({ scheduledTime: 1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews
        });

    } catch (error) {
        // This log will show up in your backend terminal
        console.error("CRITICAL: Candidate Matrix Sync Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Sync Error: The Matrix is unresponsive.",
            error: error.message 
        });
    }
});


router.get("/my-notifications", protect, async (req, res) => {
    try {
        // Find all notifications where the recipient is the logged-in user

        const candidate = await Candidate.findOne({user:req.user.id});
        if(!candidate)return res.status(400).json({message:"access prohibited"});
        const notifications = await Notification.find({ 
            recipient: candidate.id,
            isRead:false
        })
        .sort({ createdAt: -1 }) // Newest first
        .limit(20); // Keep the matrix lean

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        console.error("Neural Sync Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.patch("/mark-read/:id", protect, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Node not found." });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


module.exports = router;