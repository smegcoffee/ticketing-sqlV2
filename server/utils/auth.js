const jwt = require('jsonwebtoken');

const setUserRoleCookie = (res, role) => {
  const token = jwt.sign({ role }, 'SMCT_Ticketing_System');
  res.cookie('userRole', token, { httpOnly: true });
};

const generateAccessToken = (payload) => {
    return jwt.sign(payload, 'SMCT_Ticketing_System');
};
  
  const generateRefreshToken = (payload) => {
    return jwt.sign(payload, 'SMCT_Ticketing_System');
};
  
const verifyAccessToken = (req, res, next) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: 'Access token not found' });
  }

  jwt.verify(accessToken, 'SMCT_Ticketing_System', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid access token' });
    }

    req.username = decoded.username;
    req.userID = decoded.userId;
    req.role = decoded.role;
    req.fullname = decoded.fullName;
    next();
  });
};

const setUserRoleCookieHandler = (req, res) => {
  const { role } = req.body;
  setUserRoleCookie(res, role);
  return res.status(200).json({ message: 'User role cookie set successfully.' });
};
  
module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, setUserRoleCookieHandler };
