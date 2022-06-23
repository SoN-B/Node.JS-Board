// models/User.js

var mongoose = require('mongoose');

// schema
var userSchema = mongoose.Schema({
    username:{type:String, required:[true,'Username is required!'], unique:true},
    // 배열을 사용해서 에러메세지 내용을 원하는 대로 변경가능 (첫번째는 true/false 값이고, 두번째는 에러메세지)
    password:{type:String, required:[true,'Password is required!'], select:false},
    /*
    select:false로 설정하면 DB에서 해당 모델을 읽어 올때 해당 항목값을 읽어오지 않습니다. 
    비밀번호는 중요하기 때문에 DB에서 값을 읽어오지 않게 설정했습니다.
    */
    name:{type:String, required:[true,'Name is required!']},
    email:{type:String}
},{
    toObject:{virtuals:true}
    // virtuals:true는 virtual로 설정된 항목들을 toObject함수에서 표시하게 하는 설정
});
/*DB에 저장되는 값 이외의 항목이 필요할 땐 virtual 항목으로 만듭니다. 
즉 passwordConfirmation, originalPassword, currentPassword, newPassword는 
회원가입, 회원정보 수정을 위해 필요한 항목이지만, DB에 저장할 필요는 없는 값들입니다. 
이처럼 DB에 저장될 필요는 없지만, model에서 사용하고 싶은 항목들은 virtual로 만듭니다.
*/

// virtuals
userSchema.virtual('originalPassword') // 그 전 비밀번호
    .get(function(){ return this._originalPassword; })
    .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword') // 지금 비밀번호
    .get(function(){ return this._currentPassword; })
    .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword') // 새로운 비밀번호
    .get(function(){ return this._newPassword; })
    .set(function(value){ this._newPassword=value; });

userSchema.virtual('passwordConfirmation') // 재확인 입력
    .get(function(){ return this._passwordConfirmation; })
    .set(function(value){ this._passwordConfirmation=value; });

// password validation
// password를 DB에 생성, 수정하기 전에 값이 유효(valid)한지 확인(validate)을 하는 코드
userSchema.path('password').validate(function(v) {
var user = this; //this는 user model

// create user
if(user.isNew){
    if(!user.passwordConfirmation){ //재확인 비밀번호가 없을시,
        user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }

    if(user.password !== user.passwordConfirmation) { //둘이 다를 시,
        user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
}
//model.invalidate함수를 사용하며, 첫번째는 인자로 항목이름, 두번째 인자로 에러메세지

// update user
if(!user.isNew){
    if(!user.currentPassword){
        user.invalidate('currentPassword', 'Current Password is required!');
    }
    else if(user.currentPassword != user.originalPassword){
        user.invalidate('currentPassword', 'Current Password is invalid!');
    }

    if(user.newPassword !== user.passwordConfirmation) {
        user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
}
});

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
//user컬렉션에 대한 모델이 User인거임 만약 데이터베이스안에 user라는 컬렉션이 없을시, 
//자동으로 users라는 컬렉션을 만들고 그것을 모델로 조작할 수 있게하는듯