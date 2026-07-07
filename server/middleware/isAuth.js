import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
        // Read JWT from cookie
        const token = req.cookies.token;
        console.log("Cookies:", req.cookies);
        console.log("Token:", token);
        // Check if token exists
        if (!token) {
            return res.status(401).json({
                message: "No valid token"
            });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Save user id in request object
        req.userId = decoded.userId;

        // Continue to next middleware
        next();

    } catch (err) {
        console.error("Error in isAuth middleware:", err.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

export default isAuth;