// models/User.js

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// schema
var userSchema = mongoose.Schema({
    username:{
        type:String, 
        required:[true,'Username is required!'], 
        // 배열을 사용해서 에러메세지 내용을 원하는 대로 변경가능 (첫번째는 true/false 값이고, 두번째는 에러메세지)
        match:[/^.{4,12}$/,'Should be 4-12 characters!'],
        // match에는 regex(Regular Expression, 정규표현식)이 들어가서 값이 regex에 부합하는지 않으면 에러메세지
        trim:true, // 문자열 앞뒤에 빈칸이 있는 경우 빈칸을 제거해 주는 옵션
        unique:true
    },
    /*
    /^.{4,12}$/ : regex는 / /안에 작성합니다. 즉 / /를 통해 이게 regex임을 알수 있습니다.
    /^.{4,12}$/ : ^는 문자열의 시작 위치를 나타냅니다.
    /^.{4,12}$/ : .는 어떠한 문자열이라도 상관없음을 나타냅니다.
    /^.{4,12}$/ : {숫자1,숫자2}는 숫자1 이상, 숫자2 이하의 길이 나타냅니다.
    /^.{4,12}$/ : $는 문자열의 끝 위치를 나타냅니다.

    즉 전체 길이가 4이상 12자리 이하의 문자열이라면 이 regex를 통과
    */
    password:{
        type:String, 
        required:[true,'Password is required!'], 
        select:false
    },
    /*
    select:false로 설정하면 DB에서 해당 모델을 읽어 올때 해당 항목값을 읽어오지 않습니다. 
    비밀번호는 중요하기 때문에 DB에서 값을 읽어오지 않게 설정했습니다.
    */
    name:{
        type:String, 
        required:[true,'Name is required!'],
        match:[/^.{4,12}$/,'Should be 4-12 characters!'],
        trim:true
    },
    email:{
        type:String,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'],
        trim:true
    }
},{
    toObject:{virtuals:true}
    // virtuals:true는 virtual로 설정된 항목들을 toObject함수에서 표시하게 하는 설정
});
/*
DB에 저장되는 값 이외의 항목이 필요할 땐 virtual 항목으로 만듭니다. 
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


var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
// 8-16자리 문자열 중에 숫자랑 영문자가 반드시 하나 이상 존재해야 한다는 뜻의 regex
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';

// password validation
// password를 DB에 생성, 수정하기 전에 값이 유효(valid)한지 확인(validate)을 하는 코드
userSchema.path('password').validate(function(v) {
var user = this; //this는 user model

// create user
if(user.isNew){
    if(!user.passwordConfirmation){ //재확인 비밀번호가 없을시,
        user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }
    if(!passwordRegex.test(user.password)){
        // 정규표현식.test(문자열) 함수는 문자열에 정규표현식을 통과하는 부분이 있다면 true
        user.invalidate('password', passwordRegexErrorMessage);
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
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){ // '입력받은 password의 hash'와 '저장된 hash'가 일치하는지 확인
        user.invalidate('currentPassword', 'Current Password is invalid!');
    }
    if(user.newPassword && !passwordRegex.test(user.newPassword)){
        user.invalidate("newPassword", passwordRegexErrorMessage);
    }
    if(user.newPassword !== user.passwordConfirmation) {
        user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
}
});

// hash password
userSchema.pre('save', function (next){
    var user = this;

    if(!user.isModified('password')){ // user 생성시는 항상 true이며, user 수정시는 password가 변경되는 경우에만 true를 반환
        // isModified함수는 해당 값이 db에 기록된 값과 비교해서 변경된 경우 true를, 그렇지 않은 경우 false를 반환하는 함수
        return next();
    }
    else { // password 변경 O
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});
// 첫번째 파라미터로 설정된 event(save)가 일어나기 전(pre)에 먼저 callback 함수를 실행
// "save" event -> Model.create, model.save (즉 user를 생성하거나 user를 수정한 뒤 save 함수를 실행 할 때 -> callback 함수가 먼저 호출)

// model methods
userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password,user.password);
};
// user model의 password hash와 입력받은 password text를 비교하는 method를 추가

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
//user컬렉션에 대한 모델이 User인거임 만약 데이터베이스안에 user라는 컬렉션이 없을시, 
//자동으로 users라는 컬렉션을 만들고 그것을 모델로 조작할 수 있게하는듯