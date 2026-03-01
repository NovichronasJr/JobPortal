const router = require("express").Router();
const Job = require("../database/models/job_model");
const recruiter_model = require("../database/models/recruiter_model");
const application_model = require('../database/models/application_model');
const job_model = require('../database/models/job_model');
const interview_model = require('../database/models/interview_model');
const notification_model = require('../database/models/notification_model')
const { protect, authorize } = require("../middleware/middleware");

router.post("/newJob", protect, authorize("recruiter"), async (req, res) => {
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
      aiWeightage, // This contains hiddenSkills, accommodateFresher, maxPositions
    } = req.body;

    // 1. Validation check for essential fields
    if (!title || !description || !closingDate) {
      return res.status(400).json({
        success: false,
        message:
          "Missing core requisition parameters (Title, Briefing, or Deadline).",
      });
    }

    // 2. Create the new Job document
    const recruiter = await recruiter_model.findOne({ user: req.user.id });
    const recruiterId = recruiter._id;

    const newJob = new Job({
      recruiterId, // Taken from the 'protect' middleware
      title,
      description,
      skills,
      categories,
      experience,
      workModel: type, // Mapping 'type' from React state to 'workModel' in Schema
      workType,
      location,
      stipend,
      closingDate,
      aiWeightage, // Directly storing the secret strategy fields
      status: "active",
    });

    const savedJob = await newJob.save();

    return res.status(201).json({
      success: true,
      message:
        "Job Requisition successfully indexed and deployed to the network.",
      jobId: savedJob._id,
    });
  } catch (err) {
    console.error("❌ Job Indexing Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Engine Error: Could not deploy opening.",
      error: err.message,
    });
  }
});

router.get("/addedjobs", protect, authorize("recruiter"), async (req, res) => {
  try {
    const user_id = req.user.id;

    // 1. Find the recruiter profile
    const recruiter = await recruiter_model.findOne({ user: user_id });

    // 2. Safety check: Prevent server crash if recruiter profile is missing
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found for this user.",
      });
    }

    const recruiterId = recruiter._id;

    // 3. Find jobs and use .lean() for better performance (it returns plain JS objects)
    const recruiterJobs = await Job.find({ recruiterId })
      .populate("recruiterId")
      .sort({ createdAt: -1 });

    // 4. Return as an array inside a success object
    return res.status(200).json({
      success: true,
      count: recruiterJobs.length,
      jobs: recruiterJobs, // This keeps it as an array []
    });
  } catch (error) {
    console.error("Fetch Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve openings.",
      error: error.message,
    });
  }
});


// GET: /api/recruiter/applications/:jobId
router.get('/applications/:jobId', protect, authorize("recruiter"), async (req, res) => {
    try {
        const { jobId } = req.params;
        const userIdFromCookie = req.user.id;

        // 1. BRIDGE: Find the Recruiter entity linked to this User ID
        // Your recruiter_model has a 'user' field pointing to the User schema
        const recruiterProfile = await recruiter_model.findOne({ user: userIdFromCookie });
        
        if (!recruiterProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "Recruiter profile sync failed. No entity found for this user." 
            });
        }

        // 2. VERIFY: Ensure this Job Node belongs to the specific Recruiter ID
        const job = await job_model.findById(jobId);
        
        if (!job) {
            return res.status(404).json({ success: false, message: "Job requisition not found." });
        }

        // We compare the job's recruiterId with our fetched recruiterProfile._id
        if (job.recruiterId.toString() !== recruiterProfile._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized: Access denied to foreign Job Node." 
            });
        }

        // 3. FETCH & RANK: Get applicants and sort by AI Decision Score
        const applications = await application_model.find({ jobId })
            .populate({
                path: 'candidateId',
                // Selecting specific high-signal fields for the Recruiter UI
                select: 'firstName lastName profilePhoto skills experienceYears bio education resumeUrl' 
            })
            .sort({ aiScore: -1 }); // Rank by the AI Score calculated at 'Apply'

        res.status(200).json({
            success: true,
            jobTitle: job.title,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error("Neural Fetch Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Sync Error", 
            error: error.message 
        });
    }
});

/**
 * @route   PATCH /api/recruiter/applications/status/:appId
 * @desc    Update application status (Shortlist/Reject)
 * @access  Private (Recruiter Only)
 */
router.patch('/applications/status/:appId', protect, authorize("recruiter"), async (req, res) => {
  try {
      const { appId } = req.params;
      const { status } = req.body; // Expecting "Shortlisted" or "Rejected"
      const userIdFromCookie = req.user.id;

      // 1. INPUT VALIDATION
      const validStatuses = ["Shortlisted", "Rejected", "Pending", "Applied"];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({ 
              success: false, 
              message: "Invalid status transition detected." 
          });
      }

      // 2. FETCH APPLICATION & BRIDGE TO JOB
      // We need the jobId to verify if the recruiter owns this application
      const application = await application_model.findById(appId);
      if (!application) {
          return res.status(404).json({ success: false, message: "Application node not found." });
      }

      // 3. FETCH RECRUITER IDENTITY
      const recruiterProfile = await recruiter_model.findOne({ user: userIdFromCookie });
      if (!recruiterProfile) {
          return res.status(404).json({ success: false, message: "Recruiter entity not found." });
      }

      // 4. VERIFY OWNERSHIP VIA JOB NODE
      const job = await job_model.findById(application.jobId);
      if (!job || job.recruiterId.toString() !== recruiterProfile._id.toString()) {
          return res.status(403).json({ 
              success: false, 
              message: "Unauthorized: Access denied to foreign application data." 
          });
      }

      // 5. COMMIT THE DECISION
      application.status = status;
      await application.save();

      res.status(200).json({
          success: true,
          message: `Neural sync updated to: ${status}`,
          updatedStatus: application.status
      });

      if (status === "Shortlisted") {
        await notification_model.create({
            recipient: application.candidateId,
            title: "Link Established!",
            message: `You've been shortlisted for ${job.title}. Keep your sync active!`,
            type: "Shortlist",
            link: "/api/candidate/applied"
        });
    }

  } catch (error) {
      console.error("Status Update Error:", error);
      res.status(500).json({ 
          success: false, 
          message: "Internal Sync Error during status update.",
          error: error.message 
      });
  }
});


// GET: /api/recruiter/pipeline
router.get('/pipeline', protect, authorize("recruiter"), async (req, res) => {
  try {
      const userId = req.user.id;

      // 1. Resolve Recruiter Identity
      const recruiterProfile = await recruiter_model.findOne({ user: userId });
      if (!recruiterProfile) return res.status(404).json({ success: false, message: "Recruiter node not found." });

      // 2. Fetch Jobs belonging to this Recruiter
      const jobs = await job_model.find({ recruiterId: recruiterProfile._id }).select('title location');

      // 3. Fetch all Shortlisted Applications for these jobs
      const pipeline = await application_model.find({ 
          jobId: { $in: jobs.map(j => j._id) },
          status: { $in: ["Shortlisted", "Interviewing"] }
      })
      .populate({
          path: 'candidateId',
          select: 'firstName lastName profilePhoto skills email'
      })
      .populate('jobId', 'title');

      res.status(200).json({
          success: true,
          count: pipeline.length,
          pipeline // This is your array of shortlisted applications
      });

  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});


// POST: /api/recruiter/interviews/schedule
router.post('/interviews/schedule', protect, authorize("recruiter"), async (req, res) => {
  try {
      const { applicationId, scheduledTime, title } = req.body;

      // 1. Fetch Application to get context
      const app = await application_model.findById(applicationId);
      if (!app) return res.status(404).json({ success: false, message: "Application not found." });

      // 2. Resolve Recruiter Identity
      const recruiterProfile = await recruiter_model.findOne({ user: req.user.id });

      // 3. CREATE THE INTERVIEW NODE
      const newInterview = await interview_model.create({
          applicationId,
          candidateId: app.candidateId,
          recruiterId: recruiterProfile._id,
          jobId: app.jobId,
          title: title || "Neural Sync Session",
          scheduledTime,
          agoraChannel: `sync_${applicationId}_${Date.now()}` // Unique channel
      });

      // 4. Update Application Status to 'Interviewing'
      app.status = "Interviewing";
      await app.save();

      res.status(201).json({
          success: true,
          message: "Interview Node established in Matrix.",
          interview: newInterview
      });

      await notification_model.create({
        recipient: app.candidateId,
        title: "Interview Node Active",
        message: `A Live Sync has been scheduled for ${title} on ${new Date(scheduledTime).toLocaleString()}.`,
        type: "Interview",
        link: "/api/candidate/interviews" // Link to their specific interview matrix
    });

  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/my-interviews', protect, authorize("recruiter"), async (req, res) => {
  try {
      const userIdFromCookie = req.user.id;

      // 1. Resolve the Recruiter Identity
      const recruiterProfile = await recruiter_model.findOne({ user: userIdFromCookie });
      
      if (!recruiterProfile) {
          return res.status(404).json({ 
              success: false, 
              message: "Recruiter entity not found for this account." 
          });
      }

      // 2. Fetch all interviews associated with this Recruiter
      // We populate candidateId to get name/photo and jobId to get the title
      const interviews = await interview_model.find({ 
          recruiterId: recruiterProfile._id 
      })
      .populate({
          path: 'candidateId',
          select: 'firstName lastName profilePhoto skills' 
      })
      .populate({
          path: 'jobId',
          select: 'title'
      })
      .sort({ scheduledTime: 1 }); // Show the most urgent/upcoming interviews first

      res.status(200).json({
          success: true,
          count: interviews.length,
          interviews
      });

  } catch (error) {
      console.error("Matrix Sync Error:", error);
      res.status(500).json({ 
          success: false, 
          message: "Internal Sync Error while fetching interview matrix.",
          error: error.message 
      });
  }
});

router.patch('/interviews/complete/:interviewId', protect, authorize("recruiter"), async (req, res) => {
  try {
      const interview = await interview_model.findByIdAndUpdate(
          req.params.interviewId,
          { status: 'Completed' },
          { new: true }
      );

      if (!interview) return res.status(404).json({ success: false, message: "Interview node not found." });

      // Optional: Notify the candidate that the session is officially closed
      await notification_model.create({
          recipient: interview.candidateId,
          title: "Sync Session Closed",
          message: `Your interview for ${interview.title} has been marked as completed. We will reach out with next steps soon.`,
          type: "System",
          link: "/api/candidate/applied"
      });

      res.status(200).json({ success: true, message: "Interview node finalized." });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;
