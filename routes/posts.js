// routes/posts.js

var express  = require('express');
var router = express.Router();
var Post = require('../models/Post');
var util = require('../util');

// Index 
router.get('/', (req, res) => {
    Post.find({})                 
    .sort('-createdAt')
    // 나중에 생성된 data가 위로 오도록 정렬
    // '-' -> 내림차순, createdAt -> 정렬할 항목명
    // object를 넣는 경우 {createdAt:1} or {createdAt:-1}
    .exec((err, posts) => {   
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts});
    });
});

// New
router.get('/new', (req, res) => {
    var post = req.flash('post')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', { post:post, errors:errors });
});

// create
router.post('/', (req, res) => {
    Post.create(req.body, (err) => {
        if(err){
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/new');
        }
        res.redirect('/posts');
    });
});

// show
router.get('/:id', (req, res) => {
    Post.findOne({_id:req.params.id}, (err, post) => {
        if(err) return res.json(err);
        res.render('posts/show', {post:post});
    });
});

// edit
router.get('/:id/edit', (req, res) => {
    var post = req.flash('post')[0];
    var errors = req.flash('errors')[0] || {};
    if(!post){ // post X
        Post.findOne({_id:req.params.id}, function(err, post){
            if(err) return res.json(err);
            res.render('posts/edit', { post:post, errors:errors });
        });
    }
    else { // post O
        post._id = req.params.id;
        res.render('posts/edit', { post:post, errors:errors });
    }
});

// update
router.put('/:id', (req, res) => {
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
        if(err){
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/'+req.params.id+'/edit');
        }
        res.redirect('/posts/'+req.params.id);
    });
});
//runValidators: findOneAndUpdate는 기본설정이 schema에 있는 validation을 작동하지 않도록 되어 있기때문에 
//이 option을 통해서 validation이 작동하도록 설정해 주어야 합니다.

// destroy
router.delete('/:id', (req, res) => {
    Post.deleteOne({_id:req.params.id}, (err) => {
        if(err) return res.json(err);
        res.redirect('/posts');
    });
});

module.exports = router;