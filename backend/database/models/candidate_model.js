const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Personal Details
    phone: { type: String, trim: true },
    address: { type: String },
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    profilePhoto: { 
        type: String,
        default:'default_pics/candidate.jpg',
    }, 
    
    // Professional Identity
    bio: { 
        type: String, 
        maxLength: 500, 
        default: "Software enthusiast looking for the next big challenge." 
    },
    skills: [{ type: String }], // e.g. ["React", "Node.js", "Cybersecurity"]
    
    // The "Decision" Data
    resumeUrl: { type: String }, // Path to the uploaded PDF
    experienceYears: { type: Number, default: 0 },
    education: [{
        institution: String,
        degree: String,
        year: Number
    }],

    // System Metadata
    isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);