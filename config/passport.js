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
/*
login시에 DB에서 발견한 user를 어떻게 session에 저장할지를 정하는 부분입니다. 
user정보 전체를 session에 저장할 수도 있지만, session에 저장되는 정보가 너무 많아지면 
사이트의 성능이 떨어질 수 있고, 회원정보수정을 통해 user object가 변경되더라도 
이미 전체 user정보가 session에 저장되어 있으므로 해당 부분을 변경해 주어야하는 
등의 문제들이 있으므로 user의 id만 session에 저장합니다.
*/
passport.deserializeUser(function(id, done) {
    User.findOne({_id:id}, function(err, user) {
    done(err, user);
    });
});
/*
request시에 session에서 어떻게 user object를 만들지를 정하는 부분입니다. 
매번 request마다 user정보를 db에서 새로 읽어오는데, 
user가 변경되면 바로 변경된 정보가 반영되는 장점이 있습니다. 
다만 매번 request마다 db에서 user를 읽어와야 하는 단점이 있습니다. 
user정보를 전부 session에 저장하여 db접촉을 줄이거나, 
아니면 request마다 user를 db에서 읽어와서 데이터의 일관성을 확보하거나 자신의 상황에 맞게 선택하시면 됩니다.
*/

// local strategy
    passport.use('local-login',
    new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
        },
        function(req, username, password, done) {
        User.findOne({username:username})
                .select({password:1})
                .exec(function(err, user) {
                if (err) return done(err);

                if (user && user.authenticate(password)){
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