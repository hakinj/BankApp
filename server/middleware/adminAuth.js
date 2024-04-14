const jwt = require('jsonwebtoken');


async function verifyAdmin(req, res, next) {
    try {
        const token = req.cookies.adminToken;
        const verifiedToken = await jwt.verify(token, process.env.JWT_SECRET)
        if (verifiedToken) {
            
            next();
        } else {
            // res.redirect('/api/v2/admin-login');
            res.status(400).json({
                success: false,
                message: "invalid token"
            })
        }
    }
    catch (err) {
        console.log(err.message)
        res.status(400).json({
            success: false,
            message: "no token detected"
        })
    }
};

module.exports = {verifyAdmin};
