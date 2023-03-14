const express = require('express');
const router = express.Router();

//get product model
const Product = require('../models/product')



// get add product to cart
router.get('/add/:product', (req, res) => {
    var slug = req.params.product
    Product.findOne({ slug: slug }, (err, p) => {
        if (err)
            console.log(err)

        if (typeof req.session.cart == 'undefined') {
            req.session.cart = []
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            })

        } else {
            var cart = req.session.cart
            var newItem = true
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++
                    newItem = false;
                    break
                }
            }
            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                })
            }
        }

        // console.log(req.session.cart);
        req.flash('success', 'product added to cart')
        res.redirect('back')


    })
})

// get checkout page
router.get('/checkout', (req, res) => {
    if(req.session.cart && req.session.cart.length == 0){
        delete req.session.cart
        res.redirect('/cart/checkout')
    }else {
    res.render('checkout', {
        title: ' checkout',
        cart: req.session.cart
    })
}
})


// get update product
router.get('/update/:product', (req, res) => {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++
                    req.flash('success', 'cart added')
                    res.redirect('/cart/checkout')
                    break;
                case "remove":
                    cart[i].qty--
                    if (cart[i].qty < 1) cart.splice(i, 1)
                    req.flash('success', 'cart removed')
                    res.redirect('/cart/checkout')
                    break;
                case "clear":
                    cart.splice(i, 1)

                    if (cart.length == 0) delete req.session.cart
                    req.flash('success', 'cart cleared')
                    res.redirect('/cart/checkout')
                    break;
                default:
                    console.log('update problems')
                    break;
            }
            break;
        }
    }
    // req.flash('success', 'cart updated')
    // res.redirect('/cart/checkout')
})

// get clear cart
router.get('/clear', (req, res) => {
  delete req.session.cart

  req.flash('success', 'cart cleared')
    res.redirect('/cart/checkout')

})

// get buy now
router.get('/buy', (req, res)=>{
    delete req.session.cart;
    res.sendStatus(200)
})

 module.exports= router
