var util = {};

util.parseError = function(errors){
    var parsed = {};
    if(errors.name == 'ValidationError'){
        for(var name in errors.errors){
        var validationError = errors.errors[name];
        parsed[name] = { message:validationError.message };
        }
    } 
    else if(errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
        parsed.username = { message:'This username already exists!' };
    } 
    else {
        parsed.unhandled = JSON.stringify(errors);
    }
    return parsed;
}

/**
 * 사용자가 로그인이 되었는지 아닌지를 판단하여 로그인이 되지 않은 경우 
 * 사용자를 에러 메세지("Please login first")와 함께 로그인 페이지로 보내는 함수
 */
util.isLoggedin = function(req, res, next){
    if(req.isAuthenticated()){
        next();
    } 
    else {
        req.flash('errors', {login:'Please login first'});
        res.redirect('/login');
    }
}
/*
route에서 callback으로 사용될 함수이므로 req, res, next를 받습니다. 
로그인이 된 상태라면 다음 callback함수를 호출하게 되고, 로그인이 안된 상태라면 로그인 페이지로 redirect
*/

/**
 * 어떠한 route에 접근권한이 없다고 판단된 경우에 호출되어 에러 메세지("You don't have permission")와 함께 로그인 페이지로 보내는 함수
 */
util.noPermission = function(req, res){
    req.flash('errors', {login:"You don't have permission"});
    req.logout(function(err) {
        if (err) { return next(err); }
    });
    res.redirect('/login');
}

module.exports = util;