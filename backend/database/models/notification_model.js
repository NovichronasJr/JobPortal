const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate", 
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
  link: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);