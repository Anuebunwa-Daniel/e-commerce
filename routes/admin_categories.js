const express = require('express');
const router = express.Router();
var auth = require('../config/auth')
var isAdmin = auth.isAdmin

//get page model
const Category = require('../models/category')


//Get category index
router.get('/',  isAdmin, (req, res) => {
 Category.find((err, categories)=>{
    if(err) return console.log(err)
    res.render('admin/categories', {
        categories: categories
    })
 })
})


//Get categories page
router.get('/add_category',  isAdmin, (req, res) => {
    var title = ""

    res.render('admin/add_category', {
        title: title,
    })
})

//Post add category
router.post('/add_category', (req, res) => {
    req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors()
    if (errors) {

        res.render('admin/add_category', {
            errors: errors,
            title: title
            
        })
    } else {
        Category.findOne({ slug: slug }, (err, category) => {
            if (category) {
                req.flash('danger', 'Category title already exists, choose another')
                res.render('admin/add_category', {

                    title: title,
                   
                })
            } else {
                var category = new Category({
                    title: title,
                    slug: slug
                   
                })
                category.save((err) => {
                    if (err) return console.log(err)
                    Category.find((err, categories) => {
                        if(err){
                            //    console.log(err)
                        }else{
                    
                            req.app.locals.categories = categories
                        }
                    })
                    req.flash('success', 'category added')
                    res.redirect('/admin/categories')
                })
            }
        })
    }

})




//Get edit category
router.get('/edit-category/:id',  isAdmin, (req, res) => {
    Category.findById(req.params.id, function (err, category) {
        if (err) 
        return console.log(err);
        res.render('admin/edit-category', {
            title: category.title,
            id: category._id
        })
    })
})

//Post edit category
router.post('/edit-category/:id', (req, res) => {
    req.checkBody('title', 'Title must have a value.').notEmpty();
   

    var title = req.body.title
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id

    var errors = req.validationErrors()
    if (errors) {

        res.render('admin/edit-category', {
            errors: errors,
            title: title,
            id: id
        })
        
    } else {
        Category.findOne({ slug: slug, _id: { '$ne': id } }, (err, category) => {
            if (category) {
                req.flash('danger', 'category title already exists, choose another')
                res.render('admin/edit-category', {

                    title: title,
                    _id: id
                })
            } else {
                
                 
                Category.findById(id, (err, category) => {
                    if (err) 
                    return console.log(err);

                    category.title = title;
                    category.slug = slug;
                   

                    category.save((err) => {
                        if (err) return console.log(err)

                        Category.find((err, categories) => {
                            if(err){
                                //    console.log(err)
                            }else{
                        
                                req.app.locals.categories = categories
                            }
                        })
                        req.flash('success', 'category edited')
                        res.redirect('/admin/categories/edit-category/' + id)
                    })
                })

            }
        })
    }

})


//Get delete category
router.get('/delete-categories/:id',  isAdmin, (req, res) => {
    Category.findByIdAndRemove(req.params.id, (err)=>{
    if (err) 
    return console.log(err);

    Category.find((err, categories) => {
        if(err){
            //    console.log(err)
        }else{
    
            req.app.locals.categories = categories
        }
    })

    req.flash('success', 'category deleted')
    res.redirect('/admin/categories/')
  })
})

module.exports = router