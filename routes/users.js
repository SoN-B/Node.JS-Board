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
    var user = req.flash('user')[0] || {}; // create route에서 생성된 flash값
    // req.falsh의 값이 없다면(처음 new page에 들어온 경우), {} 빈 오브젝트 반환
    var errors = req.flash('errors')[0] || {};
    res.render('users/new', { user:user, errors:errors});
});
//에러가 있는 경우 new페이지에 에러 AND 기존에 입력했던 값들을 보여줌

// create
router.post('/', function(req, res){
    User.create(req.body, function(err){
        if(err) {
            req.flash('user', req.body);
            req.flash('errors', parseError(err));
            // parseError -> err을 분석하고 일정한 형식으로 만듬
            return res.redirect('/users/new');
        } 
        res.redirect('/users');
    });
});
// user 생성시 발생할 수 있는 오류 2가지
// 1. 첫번째는 User model의 userSchema에 설정해둔 validation을 통과하지 못한 경우
// 2. mongoDB에서 오류를 내는 경우

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

// functions
function parseError(errors){
    var parsed = {};

    if(errors.name == 'ValidationError'){
    // mongoose의 model validation error 처리
        for(var name in errors.errors){
        var validationError = errors.errors[name];
        parsed[name] = { message:validationError.message };
        }
    }
    else if(errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
    // mongoDB에서 username이 중복되는 error 처리
        parsed.username = { message:'This username already exists!' };
    }
    else {
    // 그 외 error들을 처리
        parsed.unhandled = JSON.stringify(errors);
    }
    
    return parsed;
}