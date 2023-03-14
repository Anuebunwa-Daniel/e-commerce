const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

//get Users model
const User = require('../models/user')

// get / register
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register'
    })
})

// post  register
router.post('/register', (req, res) => {
    var name = req.body.name
    var email = req.body.email
    var username = req.body.username
    var password = req.body.password
    var password2 = req.body.password2


    req.checkBody('name', 'Name is required').notEmpty()
    req.checkBody('email', 'Email is required').isEmail()
    req.checkBody('username', 'Username is required').notEmpty()
    req.checkBody('password', 'Password is required').notEmpty()
    req.checkBody('password2', 'Password do not match').equals(password)

    var errors = req.validationErrors()

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        })
    } else {
        User.findOne({ username: username }, (err, user) => {
            if (err)
                console.log(err)

            if (user) {
                console.log(user)
                req.flash('danger', 'Username exists, choose another')
                res.redirect('/users/register')
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0

                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err)
                            console.log(err)
                        user.password = hash

                        user.save((err) => {
                            if (err) {
                                console.log(err)
                            } else {
                                req.flash('success', 'Registration successful')

                                res.redirect('/users/login')
                            }
                        })
                    })
                })
            }
        })
    }

})

// get  login
router.get('/login', (req, res) => {
    if(res.locals.user) res.redirect('/')
    res.render('login', {
        title: 'Log in'
    })
})

// post  login
router.post('/login', (req, res , next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

// get  logout
router.get('/logout', (req, res) => {

    req.logout((err)=>{
        if(err) console.log (err)
    })
  

    req.flash('success', 'Logout successful')

    res.redirect('/users/login')
  
})


module.exports = router