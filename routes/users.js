var express = require('express');
var router = express.Router();
var User = require('../models/User');

// Index
router.get('/', function(req, res){
    User.find({}) 
    .sort({username:1}) // username을 기준으로 오름차순(asc)으로 정렬
    .exec(function(err, users){
        if(err) return res.json(err);
        res.render('users/index', {users:users});
    });
});

// New
router.get('/new', function(req, res){
    res.render('users/new');
});

// create
router.post('/', function(req, res){
    User.create(req.body, function(err){
        if(err) return res.json(err);
        res.redirect('/users');
    });
});

// show
router.get('/:username', function(req, res){
    User.findOne({username:req.params.username}, function(err, user){
        if(err) return res.json(err);
        res.render('users/show', {user:user});
    });
});

// edit
router.get('/:username/edit', function(req, res){
    User.findOne({username:req.params.username}, function(err, user){
        if(err) return res.json(err);
        res.render('users/edit', {user:user});
    });
});

// update
router.put('/:username', function(req, res, next){
    User.findOne({username:req.params.username})
        .select('password')
        .exec(function(err, user){
        if(err) return res.json(err);

        // update user object
        user.originalPassword = user.password; // original 설정
        user.password = req.body.newPassword? req.body.newPassword : user.password;
        // password를 업데이트 하는 경우와, password를 업데이트 하지 않는 경우
        for(var p in req.body){
            user[p] = req.body[p];
        }

        // save updated user
        user.save(function(err, user){
            if(err) return res.json(err);
            res.redirect('/users/'+user.username);
        });
    });
});
// findOneAndUpdate함수대신에 findOne함수로 값을 찾은 후에 값을 수정하고 user.save함수로 값을 저장
// (user.password를 조건에 맞게 바꿔주어야 하기 때문)
/*
user schema에서 password의 select을 false로 설정했으니 DB에 password가 있더라도 기본적으로 
password를 읽어오지 않게 되는데, select('password')를 통해서 password를 읽어오게 했습니다

ex) password를 읽어오고, name을 안 읽어오게 하고 싶다면 .select('password -name')를 입력
*/

// destroy
router.delete('/:username', function(req, res){
    User.deleteOne({username:req.params.username}, function(err){
        if(err) return res.json(err);
        res.redirect('/users');
    });
});

module.exports = router;