const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp')
const fs = require('fs-extra')
const resizeImg = require('resize-img')
var auth = require('../config/auth')
var isAdmin = auth.isAdmin

//get product model
const Product = require('../models/product')

//get category model
const Category = require('../models/category')

//Get product index
router.get('/',  isAdmin, (req, res) => {
   var count;
   Product.count ((err, c)=>{
    count = c
   })
   Product.find ((err, products)=>{
    res.render('admin/products',{
        products:products,
        count:count
    })
   })
})

//Get add Product
router.get('/add_product', isAdmin, (req, res) => {
    var title = ""
    var desc = ""
    var price= "" 

    Category.find ((err, categories)=>{
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        })
    })
  
})

//post add product
router.post('/add_product',  (req, res) => {
    let imageFile;
    if (req.files == null) {
        imageFile = "";
    } else {
        if (typeof req.files.image !== "undefined") {
            imageFile = req.files.image.name;
        } else {
            imageFile = "";
        }
    }

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'Please upload an image Jpg, Jpeg, Png').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find((err, categories) => {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({ slug: slug }, (err, product) => {
            if (product) {
                req.flash('danger', 'product title already exists, choose another');
                Category.find((err, categories) => {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });
                product.save(function(err) {
                    if (err) {
                        return console.log(err);
                    } else {
                        mkdirp('public/product_images/' + product._id, function(err){
                            if (err) {
                                console.log(err);
                            }
                        });

                        mkdirp('public/product_images/'+ product._id + '/gallery', function(err){
                            if (err) {
                                console.log(err);
                            }
                        });

                        mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err){
                            if (err) {
                                console.log(err);
                            }
                        });

                        if (imageFile != "") {
                            var productImage = req.files.image;
                            var path ='public/product_images/' + product._id +'/' +imageFile;

                            productImage.mv(path, function(err){
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }

                        req.flash('success', 'Product added');
                        res.redirect('/admin/products');
                    }
                });
            }
        });
    }
});



//Get edit product
router.get('/edit-product/:id', isAdmin, (req, res) => {
    var errors;
    if (req.session.errors) errors = req.session.errors;

    req.session.errors =null;
    Category.find ((err,  categories)=>{
       
            Product.findById(req.params.id, (err, p)=>{
                if(err){
                    console.log(err)
                    res.redirect('/admin/products')
                }else{
                    var galleryDir = 'public/product_images/' + p._id +'/gallery';

                    var galleryImages = null

                    fs.readdir(galleryDir, (err, files)=>{
                        if (err){
                            console.log(err);
                        }else{
                            galleryImages =files;
                            res.render('admin/edit-product', {
                                title: p.title,
                                errors:errors,
                                desc: p.desc,
                                categories: categories,
                                category: p.category.replace(/\s+/g, '-').toLowerCase(),
                                price: parseFloat(p.price).toFixed(2),
                                image: p.image,
                                galleryImages: galleryImages,
                                id: p._id
                            })
                        }
                    })
                }
               
            }) 
       
})
})

//Post edit product
router.post('/edit-product/:id', (req, res) => {
    // let imageFile = typeof req.files.image !=="undefined" ? req.files.image.name: "";

    let imageFile;
    if (req.files == null){
         imageFile="" 
    }else {
        // typeof req.files.image !== "undefined" ? req.files.image[0].filename : "";
        imageFile=req.files.image.name
    }


    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'Please upload an image Jpg, Jpeg, Png').isImage(imageFile)
  

    var title = req.body.title
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc
    var price = req.body.price
    var category = req.body.category
    var pimage= req.body.pimage
    var id = req.params.id
   

    var errors = req.validationErrors()
    if (errors){
        req.session.errors =errors;
        res. redirect('/admin/products/edit_product/' +id)

    }else{
        Product. findOne({slug:slug, _id: {'$ne': id}}, (err, p)=>{
            if (err)
            console.log(err)

            if (p){
                req.flash('danger', 'Product title exists, choose another.')
                res.redirect('/admin/products/edit_product/'+ id)
            }else{
                Product.findById(id, (err, p) =>{
                    if(err)
                    console.log(err)
                    p.title =title
                    p.slug =slug
                    p.desc =desc
                    p.price = parseFloat(price).toFixed(2)
                    p.category =category
                    if (imageFile != ""){
                        p.image = imageFile
                    }
                    p.save ((err)=>{
                        if (err)
                        console.log (err);

                        if (imageFile != ""){
                            if(pimage != ""){
                                fs.remove('public/product_images/' +id + '/'+ pimage, (err)=>{
                                    console.log(pimage)
                                    if(err)
                                    console.log(err)
                                    console.log('success')
                                })
                            }
                          
                                var productImage = req.files.image;
                                var path ='public/product_images/' +id+'/' +imageFile
        
                                productImage.mv(path, (err)=>{
                                    return
                                    console.log(err);
                                })
                            }
                          
                            req.flash('success', 'Product added')
                    res.redirect('/admin/products/edit-product/' + id)
                    })

                })
            }
        })
    }
})


//post product gallery
router.post('/product-gallery/:id', (req, res) => {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function(err) {
        if (err)
        console.log(err);

        resizeImg(fs.readFileSync (path), {width: 100, height: 100}).then(function(buf){
            fs.writeFileSync(thumbsPath,buf);
        })
    })
    res.sendStatus(200);
  })

//Get delete gallery images
router.get('/delete-image/:image', isAdmin,  (req, res) => {
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id  + '/gallery/thumbs/' + req.params.image;

    console.log (thumbImage)
    console.log (req.params.image)


    fs.remove (originalImage, (err)=>{
        if(err) {
            console.log (err)
        }else{
            fs.remove (thumbImage, (err)=>{
                if(err) {
                    console.log (err)
                }else{
                    req.flash('success', 'Image deleted')
                    res.redirect('/admin/products/edit-product/' + req.query.id)
                }
            })
        }

    })
})


//Get delete product
router.get('/delete-product/:id', isAdmin, (req, res) => {
   var id = req.params.id;
   var path = 'public/product_images/' + id

   fs.remove(path, (err)=>{
    if (err) {
        console.log(err)
    }else{
        Product.findByIdAndRemove(id, (err)=>{
            // console.log(err);
        })
        req.flash('success', 'Product deleted')
        res.redirect('/admin/products/')
    }
   })
  })
module.exports = router