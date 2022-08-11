//* passport package는 인증 시스템을 위한 bass package (단독 사용 X)
//* passport strategy package는 구체적인 인증 방법을 구현하는 package
//? local strategy : 입력받은 username, password과 DB에 존재하는 data의 값을 비교해서 login함

//* serialize : 로그인시에 DB로 부터 user를 찾아 session에 user 정보의 일부(간혹 전부)를 등록하는 것
//* deserialize : session에 등록된 user 정보로부터 해당 user를 object로 만드는 과정

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');

// serialize & deserialize User
passport.serializeUser(function(user, done) {
        done(null, user.id); // err, data
    });
    passport.deserializeUser(function(id, done) {
        User.findOne({_id:id}, function(err, user) {
        done(err, user);
        });
    });

// local strategy
    passport.use('local-login',
    new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
        },
        function(req, username, password, done) { // 3-2
        User.findOne({username:username})
            .select({password:1})
            .exec(function(err, user) {
            if (err) return done(err);

            if (user && user.authenticate(password)){ // 3-3
                return done(null, user);
            }
            else {
                req.flash('username', username);
                req.flash('errors', {login:'The username or password is incorrect.'});
                return done(null, false);
            }
            });
        }
    )
);

module.exports = passport;