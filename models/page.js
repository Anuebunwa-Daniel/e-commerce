const mongoose = require('mongoose')

//page schema
const pageSchema = mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    slug:{
        type: String,
    },
    content:{
        type: String,
        require: true
    },
    sorting:{
        type: Number,
        
    }
});

const Page = module.exports = mongoose.model('Page', pageSchema)