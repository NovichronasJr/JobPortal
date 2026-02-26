const router = require('express').Router();
const User = require('../database/models/user_model');
const Candidate = require('../database/models/candidate_model');
const Recruiter = require('../database/models/recruiter_model');
const jwt = require('jsonwebtoken');
const upload = require('../configs/multer_config'); 


router.post('/signup', (req, res, next) => {
    console.log("LOG: 1. Request reached /signup");
    next();
}, upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]), async (req, res) => {
    console.log("LOG: 2. Multer finished. Body:", req.body);
    console.log("LOG: 3. Files received:", req.files);

    try {
        const { email, password, role, ...profileData } = req.body;

        if (!email || !password || !role) {
            console.log("LOG: 4. Missing required fields");
            return res.status(400).json({ message: "Email, password, and role are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("LOG: 5. User exists");
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({ email, password, role });
        const savedUser = await newUser.save();
        console.log("LOG: 6. User saved with ID:", savedUser._id);

        const resumePath = req.files?.['resume']?.[0]?.path?.replace(/\\/g, '/').replace('public/', '') || null;
        const logoPath = req.files?.['logo']?.[0]?.path?.replace(/\\/g, '/').replace('public/', '') || null;

        let profile;
        if (role === 'candidate') {
            profile = new Candidate({ user: savedUser._id, ...profileData, resumeUrl: resumePath });
        } else {
            profile = new Recruiter({ user: savedUser._id, ...profileData, organizationLogo: logoPath });
        }
        
        await profile.save();
        console.log("LOG: 7. Profile saved successfully");

        res.status(201).json({ message: "Account created successfully!" });

    } catch (err) {
        console.error("CRITICAL ERROR IN SIGNUP:", err); // THIS will show in your terminal
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// --- LOGIN LOGIC ---
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role !== role) {
            return res.status(403).json({ message: "Unauthorized role access" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
});

// --- GET CURRENT USER (ME) ---
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        let profileData;
        if (user.role === 'candidate') {
            profileData = await Candidate.findOne({ user: user._id });
        } else {
            profileData = await Recruiter.findOne({ user: user._id });
        }

        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                profile: profileData 
            }
        });
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
});

module.exports = router;