const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate", // Points to the User (Candidate)
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["Shortlist", "Interview", "System"], 
    default: "Shortlist" 
  },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // URL to redirect (e.g., /dashboard/interviews)
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);