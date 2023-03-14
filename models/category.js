const mongoose = require('mongoose')

//category schema
const categorySchema = mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    slug:{
        type: String,
    }
   
});

const Category = module.exports = mongoose.model('Category', categorySchema)