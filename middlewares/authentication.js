// Assume you have an 'auth' middleware file

const { validatetoken } = require("../utills/jwt_token");

function checkForAuthentication(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];

    if (!tokenCookieValue) {
      return next();
    }
    try {
      const userPayload = validatetoken(tokenCookieValue);
      req.user = userPayload;
    } catch (error) {}
    return next();
  };
}

module.exports = {
  checkForAuthentication,
};
