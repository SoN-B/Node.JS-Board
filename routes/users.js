var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');

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
            req.flash('errors', util.parseError(err));
            // parseError -> err을 분석하고 일정한 형식으로 만듬
            return res.redirect('/users/new');
        } 
        res.redirect('/login');
    });
});
// user 생성시 발생할 수 있는 오류 2가지
// 1. 첫번째는 User model의 userSchema에 설정해둔 validation을 통과하지 못한 경우
// 2. mongoDB에서 오류를 내는 경우

// show
router.get('/:username', util.isLoggedin, checkPermission, function(req, res){
    User.findOne({username:req.params.username}, function(err, user){
        if(err) return res.json(err);
        res.render('users/show', {user:user});
    });
});

// edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res){
    var user = req.flash('user')[0];
    var errors = req.flash('errors')[0] || {};
    if(!user){ // edit에 처음 접속하는경우
        User.findOne({username:req.params.username}, function(err, user){
            if(err) return res.json(err);
            res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    });
    }
    else { // edit의 update후 에러가 있을시
        res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    }
    /*
    이제부터 render시에 username을 따로 보내주는데, 이전에는 user.username이 항상 
    해당 user의 username이였지만 이젠 user flash에서 값을 받는 경우 username이 
    달라 질 수도 있기 때문에 주소에서 찾은 username을 따로 보내주게됩니다.
    */
});
/*
edit은 처음 접속하는 경우에는 DB에서 값을 찾아 form에 기본값을 생성하고, 
update에서 오류가 발생해 돌아오는 경우에는 기존에 입력했던 값으로 form에 값들을 생성
*/

// update
router.put('/:username', util.isLoggedin, checkPermission, function(req, res, next){
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
            if(err) {
                req.flash('user', req.body);
                req.flash('errors', util.parseError(err));
                return res.redirect('/users/'+req.params.username+'/edit'); 
            }
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

/**
 * 해당 user의 id와 로그인된 user.id를 비교해서 같은 경우에만 계속 진행(next())하고, 
 * 만약 다르다면 util.noPermission함수를 호출하여 login 화면으로 돌려보냅니다.
 */
function checkPermission(req, res, next){
    User.findOne({username:req.params.username}, (err, user) => {
        if(err) return res.json(err);
        if(user.id != req.user.id) return util.noPermission(req, res);
    
        next();
    });
}

// show, edit, update에util.isLoggedin과 checkPermission를 사용해서 로그인이 되고 자신의 데이터에 접근하는 경우에만 해당 route을 사용할 수 있습니다.
