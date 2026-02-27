// const router = require('express').Router();
// const fs = require('fs');
// const path = require('path');
// const Candidate = require('../database/models/candidate_model');
// const upload = require('../configs/multer_config');
// const { protect } = require('../middleware/middleware');

// /**
//  * @route   PUT /api/candidate/update-profile
//  * @desc    Update candidate profile, replace assets, and trigger mock AI extraction
//  * @access  Private
//  */
// router.put('/update-profile',protect,upload.fields([
//     { name: 'profilephoto', maxCount: 1 },
//     { name: 'resume', maxCount: 1 }
// ]), async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const candidate = await Candidate.findOne({ user: userId });

//         if (!candidate) return res.status(404).json({ message: "Candidate not found." });

//         // --- 1. PREPARE METADATA ---
//         const { bio, phone, address, skills } = req.body;
//         let updateData = { bio, phone, address };

//         // Parse skills if they arrive as a JSON string from FormData
//         if (skills) {
//             try {
//                 updateData.skills = JSON.parse(skills);
//             } catch (e) {
//                 updateData.skills = skills; // Fallback if already an array
//             }
//         }

//         // --- 2. PROFILE PHOTO LOGIC (REPLACE & PURGE) ---
//         if (req.files && req.files['profilephoto']) {
//             const newPhotoPath = `candidate/profilephoto/${req.files['profilephoto'][0].filename}`;

//             // Only delete if it's NOT the default system image
//             if (candidate.profilePhoto && candidate.profilePhoto !== "default_pics/candidate.jpg") {
//                 const oldPath = path.resolve('public', candidate.profilePhoto);
//                 if (fs.existsSync(oldPath)) {
//                     fs.unlinkSync(oldPath); 
//                 }
//             }
//             updateData.profilePhoto = newPhotoPath;
//         }

//         // --- 3. RESUME LOGIC (REPLACE, PURGE & MOCK AI) ---
//         if (req.files && req.files['resume']) {
//             const newResumePath = `candidate/resume/${req.files['resume'][0].filename}`;

//             // Purge old resume from disk to save space
//             if (candidate.resumeUrl) {
//                 const oldResumePath = path.resolve('public', candidate.resumeUrl);
//                 if (fs.existsSync(oldResumePath)) {
//                     fs.unlinkSync(oldResumePath);
//                 }
//             }
//             updateData.resumeUrl = newResumePath;

//             // ============================================================
//             // 🤖 [AI-LLM INTEGRATION POINT]: RESUME SKILL EXTRACTION
//             // TODO: Use pdf-parse to extract text and send to Gemini/OpenAI
//             // Simulation: Update skill stack based on the "new" resume
//             // ============================================================
//             const mockExtractedSkills = [
//                 "MERN Stack", 
//                 "Next.js 14", 
//                 "Cloud Architecture", 
//                 "AI Integration", 
//                 "Cybersecurity Fundamentals"
//             ];
            
//             updateData.skills = mockExtractedSkills;
//             updateData.isProfileComplete = true; // Mark profile as active
//             // ============================================================
//         }

//         // --- 4. EXECUTE ATOMIC UPDATE ---
//         const updatedProfile = await Candidate.findOneAndUpdate(
//             { user: userId },
//             { $set: updateData },
//             { new: true, runValidators: true }
//         );

//         res.status(200).json({
//             success: true,
//             message: req.files['resume'] 
//                 ? "Profile updated with AI-extracted skills." 
//                 : "Profile synchronized successfully.",
//             profile: updatedProfile
//         });

//     } catch (error) {
//         console.error("Critical Profile Update Error:", error);
//         res.status(500).json({ 
//             success: false, 
//             message: "Internal Server Error during profile sync." 
//         });
//     }
// });

// module.exports = router;

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Candidate = require('../database/models/candidate_model');
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

module.exports = router;