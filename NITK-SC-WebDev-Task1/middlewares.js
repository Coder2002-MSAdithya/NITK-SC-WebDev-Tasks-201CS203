const jwt = require("jsonwebtoken");

function generateToken(user) 
{
    const payload = {
      userId: user._id,
      email: user.email,
      name: user.name
    };
  
    return jwt.sign(payload, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
}
  
// Middleware to check if user is logged in
function authenticateUser(req, res, next) 
{
    const token = req.cookies.token;
  
    if (!token) {
      // User is not logged in
      return res.redirect('/login');
    }
  
    jwt.verify(token, 'YOUR_SECRET_KEY', (err, decoded) => {
      if (err) {
        console.error('Failed to verify token', err);
        return res.redirect('/login');
      }
  
      // User is logged in, store user data in request object
      req.user = decoded;
      next();
    });
}

function checkAuth(req, res, next)
{
    const token = req.cookies.token

    if(!token)
    {
        req.user = null
        return next()
    }

    jwt.verify(token, 'YOUR_SECRET_KEY', (err, decoded) => {
        if (err) {
          req.user = null
        }
    
        // User is logged in, store user data in request object
        req.user = decoded;
        next();
    })
}

function hello()
{
    console.log("Hello World!")
}

module.exports = {checkAuth, authenticateUser, generateToken, hello}