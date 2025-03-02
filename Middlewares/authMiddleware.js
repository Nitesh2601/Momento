


const jwt = require('jsonwebtoken');
 
const User = require('../Models/User');

require('dotenv').config();


const authMiddleware = async (req, res, next) => {

  const token = req.header('Authorization');
  
  

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id).select('-password'); // Exclude password from req.user


    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid token' });
  }

  
};


module.exports = {authMiddleware} ; 
   
