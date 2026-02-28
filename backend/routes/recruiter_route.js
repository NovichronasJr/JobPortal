const router = require('express').Router();
const Job = require('../database/models/job_model');
const recruiter_model = require('../database/models/recruiter_model');
const {protect,authorize} = require('../middleware/middleware');

router.post('/newJob', protect, authorize('recruiter'), async (req, res) => {
    try {
        const { 
            title, 
            description, 
            skills, 
            categories, 
            experience, 
            type, 
            workType, 
            location, 
            stipend, 
            closingDate,
            aiWeightage // This contains hiddenSkills, accommodateFresher, maxPositions
        } = req.body;

        // 1. Validation check for essential fields
        if (!title || !description || !closingDate) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing core requisition parameters (Title, Briefing, or Deadline)." 
            });
        }

        // 2. Create the new Job document
        const recruiter = await recruiter_model.findOne({user:req.user.id});
        const recruiterId = recruiter._id;

        const newJob = new Job({
            recruiterId, // Taken from the 'protect' middleware
            title,
            description,
            skills,
            categories,
            experience,
            workModel: type,      // Mapping 'type' from React state to 'workModel' in Schema
            workType,
            location,
            stipend,
            closingDate,
            aiWeightage,         // Directly storing the secret strategy fields
            status: 'active'
        });

        const savedJob = await newJob.save();

        return res.status(201).json({
            success: true,
            message: "Job Requisition successfully indexed and deployed to the network.",
            jobId: savedJob._id
        });

    } catch (err) {
        console.error("❌ Job Indexing Error:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Engine Error: Could not deploy opening.",
            error: err.message 
        });
    }
});

router.get('/addedjobs', protect, authorize('recruiter'), async (req, res) => {
    try {
        const user_id = req.user.id;
        
        // 1. Find the recruiter profile
        const recruiter = await recruiter_model.findOne({ user: user_id });

        // 2. Safety check: Prevent server crash if recruiter profile is missing
        if (!recruiter) {
            return res.status(404).json({ 
                success: false, 
                message: "Recruiter profile not found for this user." 
            });
        }

        const recruiterId = recruiter._id;

        // 3. Find jobs and use .lean() for better performance (it returns plain JS objects)
        const recruiterJobs = await Job.find({ recruiterId }).populate('recruiterId').sort({ createdAt: -1 });

        // 4. Return as an array inside a success object
        return res.status(200).json({
            success: true,
            count: recruiterJobs.length,
            jobs: recruiterJobs // This keeps it as an array []
        });

    } catch (error) {
        console.error("Fetch Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve openings.",
            error: error.message 
        });
    }
});

module.exports = router;