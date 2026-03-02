const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    
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
    
    
    position: { 
        type: String, 
        placeholder: "e.g., Senior Technical Recruiter" 
    },
    industry: { 
        type: String 
    },
    
    
    isVerified: { 
        type: Boolean, 
        default: false 
    }, 
    activeJobsCount: { 
        type: Number, 
        default: 0 
    },

    
    joinedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Recruiter', recruiterSchema);