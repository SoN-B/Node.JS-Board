// routes/posts.js

var express  = require('express');
var router = express.Router();
var Post = require('../models/Post');
var util = require('../util');

// Index 
router.get('/', (req, res) => {
    Post.find({})            
    .populate('author')     
    .sort('-createdAt')
    // 나중에 생성된 data가 위로 오도록 정렬
    // '-' -> 내림차순, createdAt -> 정렬할 항목명
    // object를 넣는 경우 {createdAt:1} or {createdAt:-1}
    .exec((err, posts) => {   
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts});
    });
});

// New *
router.get('/new', util.isLoggedin, (req, res) => {
    var post = req.flash('post')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', { post:post, errors:errors });
});

// create *
router.post('/', util.isLoggedin, (req, res) => {
    req.body.author = req.user._id;
    // req.user는 로그인을 하면 passport에서 자동으로 생성
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
    Post.findOne({_id:req.params.id})
    .populate('author')
    .exec(function(err, post){
        if(err) return res.json(err);
        res.render('posts/show', {post:post});
    });
});
// Model.populate() : relationship이 형성되어 있는 항목의 값을 생성해 줍니다. 
// 현재 post의 author에는 user의 id가 기록되어 있는데, 이 값을 바탕으로 실제 user의 값을 author에 생성
/*
Data 예시
{ 
    _id: {$oid :5a23c1b5d52a003c98e13f1c},
    name: 'CharmSae',
    age: 16, 
    stories : {
        author : {$oid :5a23c1b5d52a003c98e13f1d},
        title : 'HueMoneLabStory'
        fans : {$oid :5a23c1b5d52a003c98e13f1d},
    },
}
*/

// edit **
router.get('/:id/edit', util.isLoggedin, checkPermission, (req, res) => {
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

// update **
router.put('/:id', util.isLoggedin, checkPermission, (req, res) => {
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
router.delete('/:id', util.isLoggedin, checkPermission, (req, res) => {
    Post.deleteOne({_id:req.params.id}, (err) => {
        if(err) return res.json(err);
        res.redirect('/posts');
    });
});

/**
 * 해당 게시물에 기록된 author와 로그인된 user.id를 비교해서 같은 경우에만 계속 진행(next())하고, 
 * 만약 다르다면 util.noPermission함수를 호출하여 login 화면으로 돌려보냅니다.
 */
function checkPermission(req, res, next) {
    Post.findOne({_id:req.params.id}, (err, post) => {
        if(err) return res.json(err);
        if(post.author != req.user.id) return util.noPermission(req, res);
    
        next();
    });
}

module.exports = router;