// index.js
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
/*
flash는 변수처럼 이름과 값(문자열, 숫자, 배열, 객체 등등)을 저장할 수 있는데, 
한번 생성 되면 사용될 때까지 서버 메모리상에 저장이 되어 있다가 한번 사용되면 사라지는 형태의 data

req.flash(문자열, 저장할_값) : 저장할_값(숫자, 문자열, 오브젝트등 어떠한 값이라도 가능)을 해당 문자열에 저장
req.flash(문자열) : 해당 문자열에 저장된 값들을 배열로 불러옵니다. 저장된 값이 없다면 빈 배열([])을 return
*/
var session = require('express-session');
// express-session은 connect-flash를 실행하기 위해 필요한 package
/*
session은 서버에서 접속자를 구분시키는 역할을 합니다. 
user1과 user2가 웹사이트를 보고 있는 경우 해당 user들을 구분하여 
서버에서 필요한 값 들(예를 들어 로그인 상태 정보 등등)을 따로 관리하게 됩니다. 
flash에 저장되는 값 역시 user1이 생성한 flash는 user1에게, 
user2가 생성한 flash는 user2에게 보여져야 하기 때문에 session이 필요합니다.
*/
var passport = require('./config/passport');
var app = express();

// DB setting
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once('open', () => {
  console.log('DB connected');
});
db.on('error', (err) => {
  console.log('DB ERROR : ', err);
});

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));
app.use(flash()); 
/*
resave는 세션에 변화가 없을 시 저장을 할 것인지를 설정할 수 있다.
saveUninitialized는 세션이 비었을 시 빈 값을 넣을 것인지를 설정할 수 있게 한다. 
secret은session을 hash화하는데 사용되는 값으로 비밀번호 정도로 생각하면 됩니다. 
아무값이나 넣어주고 해커가 알 수 없게 합시다.
*/
// Passport setting
app.use(passport.initialize()); // 초기화
app.use(passport.session()) // passport와 session연결

app.use(function(req,res,next){ // app.use에 함수를 넣은 것을 middleware라고 합니다.
  res.locals.isAuthenticated = req.isAuthenticated(); // (ejs에서 user가 로그인이 되어 있는지 아닌지를 확인)
  // 현재 로그인이 되어있는지 아닌지를true,false
  res.locals.currentUser = req.user; // (로그인된 user의 정보)
  // 로그인이 되면 session으로 부터 user를 deserialize하여 생성
  next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));

// Port setting
var port = 3000;
app.listen(port, () => {
  console.log('server on! http://localhost:'+port);
});