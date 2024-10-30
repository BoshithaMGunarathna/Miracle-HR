const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header('Authorization')?.split(" ")[1];
  if (!token) return res.status(401).send('Access Denied');

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    
    req.user = user; // Attach user info to the request object
    next(); // Call the next middleware or route handler
  });
};

module.exports = authenticateToken;
