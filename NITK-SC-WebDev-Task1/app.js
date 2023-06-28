const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const app = express();
const cookieParser = require('cookie-parser');

// Require the middlewares from the middlewares.js file
const { checkAuth, authenticateUser, generateToken, hello} = require('./middlewares');

hello()

app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser());

const mongoURI = "mongodb+srv://adithya_ms:root@cluster0.fucyp0u.mongodb.net/connectEdDB"

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
    res.render("failure.ejs", {errorMessage: err})
});

// Create a user schema
if (!mongoose.models.User) 
{
    const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: {type: Number},
    major: { type: String },
    university: { type: String },
    gender: { type: String },
    bio: { type: String },
    });

    console.log("Creating schema for User model")
    
    // Create a user model
    mongoose.model('User', userSchema);
}

app.get("/", checkAuth, (req, res) => {
    res.render("index.ejs", {user: req.user})
})

app.get("/login", checkAuth, (req, res) => {
    console.log(req.user)
    if(req.user)
    {
        res.redirect("/dashboard")
    }
    else
    {
        res.render("login.ejs", {user: null})
    }
})

app.post("/login", checkAuth, (req, res) => {
    const { username, password } = req.body;

    //Get the User model
    const User = mongoose.model('User');

    // Find the user by email
    User.findOne({ email: username })
        .then((user) => {
        if (!user) {
            // User not found
            return res.status(404).send('User not found');
        }

        // Compare the submitted password with the stored password hash
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
            console.error('Password comparison error', err);
            return res.status(500).send('Internal server error: ', err);
            }

            if (result) {
            // Passwords match, user is authenticated
            // Generate a JWT token
            const token = generateToken(user);

            // Store the token in a cookie
            res.cookie('token', token, { httpOnly: true });

            // Redirect to a protected page or send a success response
            res.redirect("/dashboard");
            } else {
            // Passwords don't match
            res.status(401).send('Incorrect password');
            }
        });
        })
        .catch((err) => {
        console.error('Login error', err);
        res.status(500).send('Internal server error: ' + err);
        });
});

// Protected route accessible only for logged-in users
app.get('/dashboard', authenticateUser, (req, res) => {
  res.render('dashboard', { user: req.user }) // Render your protected page template (e.g., dashboard.ejs)
});

// Protected route accessible only for logged-in users
app.get("/profile", authenticateUser, (req, res) => {
    res.render('profile', {user: req.user})
})

app.get("/signup", checkAuth, (req, res) => {
    if(req.user)
    {
        res.redirect("/dashboard")
    }
    else
    {
        res.render("signup.ejs", {user: null})
    }
})

app.post("/signup", checkAuth, async (req, res) => {
    const User = mongoose.model('User');
    const { name, email, password, confirm_password, major, university, gender, bio } = req.body;
    const emailRegx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    const emailIsValid = emailRegx.test(email)

    if(!emailIsValid)
    {
        res.render("failure.ejs", {errorMessage: "Provided email address is not valid"})
    }
    else if((await User.find({email})).length)
    {
        res.render("failure.ejs", {errorMessage: "User with the given email ID already exists"})
    }
    else if(password !== confirm_password)
    {
        res.render("failure.ejs", {errorMessage: "Password and confirm password do NOT match"})
    }
    else
    {
        try
        {
            // Generate a salt to use during hashing
            const salt = await bcrypt.genSalt(10);

            // Hash the password using the salt
            const hashedPassword = await bcrypt.hash(password, salt);

            //Create a new user
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                major,
                university,
                gender,
                bio,
            });
            
            // Save the user to the database
            newUser.save()
            .then(() => {
                res.render("success.ejs");
            })
            .catch((err) => {
                res.render("failure.ejs", {errorMessage: err})
            });
        }
        catch(err)
        {
            res.render("failure.ejs", {errorMessage: err})
        }
    }
})

app.get('/logout', (req, res) => {
    // Clear the authentication token by removing the 'token' cookie
    res.clearCookie('token');
    
    // Redirect the user to the login page or any other desired page
    res.redirect('/login');
})

app.get("/docs/password_requirements", (req, res) => {
    res.render("pwd_req.ejs", {user: req.user})
})

app.get("/docs/terms_of_service", (req, res) => {
    res.render("tos.ejs", {user: req.user})
})

app.listen(3000, () => {
    console.log(`Server is running on port 3000`)
})