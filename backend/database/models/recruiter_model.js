const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    // Link to the base User (Email, Password, Role)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Organization Identity
    organizationName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    organizationLogo: { 
        type: String, 
        default: "default_pics/recruiter.jpg"
    },
    organizationWebsite: { 
        type: String, 
        trim: true 
    },
    
    // Professional Details
    position: { 
        type: String, 
        placeholder: "e.g., Senior Technical Recruiter" 
    },
    industry: { 
        type: String 
    },
    
    // Verification & Decision Data
    isVerified: { 
        type: Boolean, 
        default: false 
    }, // High-value for "Decision" security
    activeJobsCount: { 
        type: Number, 
        default: 0 
    },

    // Metadata
    joinedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Recruiter', recruiterSchema);