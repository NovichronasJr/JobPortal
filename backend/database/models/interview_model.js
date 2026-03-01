const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application", // Points to your application_model
    required: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recruiter",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  title: { type: String, default: "Technical Sync: Round 1" },
  scheduledTime: { type: Date, required: true },
  agoraChannel: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Scheduled", "Completed", "Cancelled"], 
    default: "Scheduled" 
  },
  meetingLink: { type: String }, // Optional: fallback link
}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);