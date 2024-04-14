const jwt = require('jsonwebtoken');
const {CatchErrorFunc} = require('./CatchErrorFunc')



async function getCurrentAdmin(req){
    const adminToken = req.cookies.adminToken
    const verifiedToken = await jwt.verify(adminToken, process.env.JWT_SECRET);
    return verifiedToken.id
}
    


module.exports = {getCurrentAdmin};