// passwordUtils.js

const crypto = require('crypto');

const generateSalt = () => {
    return crypto.randomBytes(16).toString('hex'); 
};

const hashPassword = (password, salt) => {
    const hashedPassword = crypto
        .createHmac('sha256', salt)
        .update(password)
        .digest('hex'); 

    return hashedPassword;
};

module.exports = { generateSalt, hashPassword };
