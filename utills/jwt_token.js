const jwt = require('jsonwebtoken');
const secret = '123@Rahul'

function createTokenForUser(user){
    const payload = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role
    };
    const token = jwt.sign(payload,secret);
    return token;
}

function validatetoken(token){
    const payload = jwt.verify(token,secret);
    return payload;
}

module.exports = {
    createTokenForUser,
    validatetoken
}