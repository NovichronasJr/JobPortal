const jwt = require('jsonwebtoken');
const User = require('../database/models/user_model');

const protect = async (req, res, next) => {
    try {
        // 1. Get the big 'COOKIE' string
        const cookieData = req.cookies?.COOKIE; 

        if (!cookieData) {
            return res.status(401).json({ message: "No session found." });
        }

        // 2. Parse the JSON string to get the token inside
        const parsedData = JSON.parse(cookieData);
        const token = parsedData.token;

        if (!token) {
            return res.status(401).json({ message: "Token missing from session." });
        }

        // 3. Verify the actual token string
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ message: "Invalid Session." });
    }
};

module.exports = { protect };