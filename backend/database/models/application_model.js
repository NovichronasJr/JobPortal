const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // 1. LINK TO THE JOB
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },

  // 2. LINK TO THE CANDIDATE (Points to Candidate schema, not User)
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: true 
  },

  // 3. APPLICATION METADATA
  status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Interviewing', 'Rejected', 'AI-Flagged'], 
    default: 'Applied' 
  },

  // 4. THE COMPANION'S INPUT
  aiScore: { 
    type: Number, 
    default: 0 // We will update this when the AI "scans" the candidate's Resume vs Job requirements
  },

  appliedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// PREVENT DUPLICATES: One candidate can only apply to a specific job once
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);