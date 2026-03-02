const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({

  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },

  
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: true 
  },

  
  status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Interviewing', 'Rejected', 'AI-Flagged'], 
    default: 'Applied' 
  },

  
  aiScore: { 
    type: Number, 
    default: 0 
  },

  appliedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });


applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);