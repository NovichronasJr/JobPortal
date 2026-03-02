const jwt = require('jsonwebtoken');
const User = require('../database/models/user_model');

const protect = async (req, res, next) => {
    try {
        
        const cookieData = req.cookies?.COOKIE; 

        if (!cookieData) {
            return res.status(401).json({ message: "No session found." });
        }

        const parsedData = JSON.parse(cookieData);
        const token = parsedData.token;

        if (!token) {
            return res.status(401).json({ message: "Token missing from session." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ message: "Invalid Session." });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Authentication required before authorization." 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access Denied: Role '${req.user.role}' is not authorized for this resource.` 
            });
        }

        next();
    };
};

module.exports = { protect,authorize};