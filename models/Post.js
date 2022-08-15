var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    title:{type:String, required:[true, 'Title is required!']},
    body:{type:String, required:[true, 'Body is required!']},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date},
});

var Post = mongoose.model('Post', postSchema);
module.exports = Post;