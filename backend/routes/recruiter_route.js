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
      aiWeightage, 
    } = req.body;

    
    if (!title || !description || !closingDate) {
      return res.status(400).json({
        success: false,
        message:
          "Missing core requisition parameters (Title, Briefing, or Deadline).",
      });
    }

    
    const recruiter = await recruiter_model.findOne({ user: req.user.id });
    const recruiterId = recruiter._id;

    const newJob = new Job({
      recruiterId, 
      title,
      description,
      skills,
      categories,
      experience,
      workModel: type, 
      workType,
      location,
      stipend,
      closingDate,
      aiWeightage, 
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
    const recruiter = await recruiter_model.findOne({ user: user_id });

    if (!recruiter) return res.status(404).json({ success: false, message: "Profile missing." });

    const recruiterJobs = await Job.aggregate([
      { $match: { recruiterId: recruiter._id } },
      {
        $lookup: {
          from: "applications", 
          localField: "_id",
          foreignField: "jobId",
          as: "applicantNodes"
        }
      },
      {
        $addFields: {
          applicantCount: { $size: "$applicantNodes" },
          maxSeats: "$aiWeightage.maxPositions", 
          recruiterId: recruiter 
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      count: recruiterJobs.length,
      jobs: recruiterJobs, 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/extend-job/:id", protect, async (req, res) => {
  try {
      const { newClosingDate } = req.body;
      
      const updatedJob = await Job.findByIdAndUpdate(
          req.params.id,
          { closingDate: newClosingDate },
          { new: true }
      );

      res.status(200).json({
          success: true,
          message: "Sync window successfully extended.",
          updatedJob
      });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});


router.get('/applications/:jobId', protect, authorize("recruiter"), async (req, res) => {
    try {
        const { jobId } = req.params;
        const userIdFromCookie = req.user.id;

        const recruiterProfile = await recruiter_model.findOne({ user: userIdFromCookie });
        
        if (!recruiterProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "Recruiter profile sync failed. No entity found for this user." 
            });
        }

        
        const job = await job_model.findById(jobId);
        
        if (!job) {
            return res.status(404).json({ success: false, message: "Job requisition not found." });
        }

        
        if (job.recruiterId.toString() !== recruiterProfile._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized: Access denied to foreign Job Node." 
            });
        }

        const applications = await application_model.find({ jobId })
            .populate({
                path: 'candidateId',
                select: 'firstName lastName profilePhoto skills experienceYears bio education resumeUrl' 
            })
            .sort({ aiScore: -1 });

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


router.patch('/applications/status/:appId', protect, authorize("recruiter"), async (req, res) => {
  try {
      const { appId } = req.params;
      const { status } = req.body; 
      const userIdFromCookie = req.user.id;

      const validStatuses = ["Shortlisted", "Rejected", "Pending", "Applied"];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({ 
              success: false, 
              message: "Invalid status transition detected." 
          });
      }

      const application = await application_model.findById(appId);
      if (!application) {
          return res.status(404).json({ success: false, message: "Application node not found." });
      }

      const recruiterProfile = await recruiter_model.findOne({ user: userIdFromCookie });
      if (!recruiterProfile) {
          return res.status(404).json({ success: false, message: "Recruiter entity not found." });
      }

      const job = await job_model.findById(application.jobId);
      if (!job || job.recruiterId.toString() !== recruiterProfile._id.toString()) {
          return res.status(403).json({ 
              success: false, 
              message: "Unauthorized: Access denied to foreign application data." 
          });
      }

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


router.get('/pipeline', protect, authorize("recruiter"), async (req, res) => {
  try {
      const userId = req.user.id;
      const recruiterProfile = await recruiter_model.findOne({ user: userId });
      if (!recruiterProfile) return res.status(404).json({ success: false, message: "Recruiter node not found." });

      const jobs = await job_model.find({ recruiterId: recruiterProfile._id }).select('title location');
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
          pipeline 
      });

  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});



router.post('/interviews/schedule', protect, authorize("recruiter"), async (req, res) => {
  try {
      const { applicationId, scheduledTime, title } = req.body;

      
      const app = await application_model.findById(applicationId);
      if (!app) return res.status(404).json({ success: false, message: "Application not found." });

      
      const recruiterProfile = await recruiter_model.findOne({ user: req.user.id });

     
      const newInterview = await interview_model.create({
          applicationId,
          candidateId: app.candidateId,
          recruiterId: recruiterProfile._id,
          jobId: app.jobId,
          title: title || "Neural Sync Session",
          scheduledTime,
          agoraChannel: `sync_${applicationId}_${Date.now()}` 
      });

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
        link: "/api/candidate/interviews" 
    });

  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/my-interviews', protect, authorize("recruiter"), async (req, res) => {
  try {
      const userIdFromCookie = req.user.id;
      const recruiterProfile = await recruiter_model.findOne({ user: userIdFromCookie });
      
      if (!recruiterProfile) {
          return res.status(404).json({ 
              success: false, 
              message: "Recruiter entity not found for this account." 
          });
      }

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
      .sort({ scheduledTime: 1 }); 

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
