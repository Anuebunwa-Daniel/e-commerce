const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const config = require('./config/database')
const router = express.Router();
const bodyParser = require('body-parser')
const session = require('express-session')
const expressValidator = require('express-validator')
const fileUpload = require('express-fileupload')
const passport = require('passport')

const fs = require('fs-extra')

// connect to db
mongoose.connect(config.database)

    .then(() => {
        console.log('connected to the database')
    })
    .catch((err) => {
        console.log(err + 'Database connection failed')
    })

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// set public folder
app.use(express.static(path.join(__dirname, 'public')))

//set global errors variable
app.locals.errors = null

//get Page Model
var Page = require('./models/page')
//get all pages to pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
    if(err){
           console.log(err)
    }else{

        app.locals.pages = pages
    }

})

//get category Model
var Category = require('./models/category')
//get all pages to pass to header.ejs
Category.find((err, categories) => {
    if(err){
           console.log(err)
    }else{

        app.locals.categories = categories
    }
})


//Express fileupload middleware
app.use(fileUpload())

//body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Expree session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}))

//Express Validator midddleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']'
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }

    },

    customValidators: {
        isImage: (value, filename) => {
            var extension = (path.extname(filename)).toLowerCase();

            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }


}))



//Express message middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
//passport config
require('./config/passport')(passport)

//passport midleware
app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next)=>{
    res.locals.cart = req.session.cart;
    res.locals.user = req.user|| null;
    next()
})

//set router
const pages = require("./routes/pages.js")
const adminPages = require("./routes/admin_pages.js")
const adminCategories = require("./routes/admin_categories.js")
const adminProducts = require("./routes/admin_products.js")
const users = require("./routes/users.js")
const cart = require("./routes/cart.js")

//for the front view
const products = require("./routes/products.js")

//for the front view
app.use('/products', products)
app.use('/cart', cart)
app.use('/users', users)
//for the admin view
app.use('/', pages)
app.use('/admin/pages', adminPages)
app.use('/admin/categories', adminCategories)
app.use('/admin/products', adminProducts)


// start the server
const port = 3000;
app.listen(port, () => {
    console.log('server started at port ' + port)
})