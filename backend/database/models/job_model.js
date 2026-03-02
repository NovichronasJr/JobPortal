const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true }, 
    skills: [{ type: String }],
    categories: [{ type: String }],
    experience: { type: String },
    workModel: { 
        type: String, 
        enum: ['Remote', 'Hybrid', 'Onsite'], 
        default: 'Remote' 
    },
    workType: { 
        type: String, 
        enum: ['Full-time', 'Internship', 'Part-time'], 
        default: 'Full-time' 
    },
    location: { type: String },
    stipend: { type: String },
    closingDate: { type: Date, required: true },
    
    aiWeightage: {
        hiddenSkills: [{ type: String }],
        accommodateFresher: { type: String },
        maxPositions: { type: Number, default: 1 }
    },

    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

JobSchema.post('init', function(doc) {
    if (doc.closingDate && new Date() > doc.closingDate) {
        doc.status = 'inactive';
    }
});

JobSchema.virtual('isExpired').get(function() {
    return new Date() > this.closingDate;
});


module.exports = mongoose.model('Job', JobSchema);