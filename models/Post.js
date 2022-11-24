var mongoose = require('mongoose');
var Counter = require('./Counter');

var postSchema = mongoose.Schema({
    title:{type:String, required:[true, 'Title is required!']},
    body:{type:String, required:[true, 'Body is required!']},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
    views:{type:Number, default:0},
    numId:{type:Number},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date},
});
// Schema.Types.ObjectId: 그 document를 가리키는 타입

// Schema.pre함수는 첫번째 파라미터로 설정된 event가 일어나기 전(pre)에 먼저 callback 함수를 실행시킵니다
// "save" event는 Model.create, model.save함수 실행시 발생하는 event
postSchema.pre('save', async function (next) {
    var post = this;
    if(post.isNew){ // 글이 새로 생성된 경우 counter의 posts를 불러와 카운팅
        counter = await Counter.findOne({name:'posts'}).exec();
        if(!counter) counter = await Counter.create({name:'posts'}); // 글이 아무 것도 없었을 경우 카운팅생성
        counter.count++;
        counter.save();
        post.numId = counter.count;
    }
    return next();
});

var Post = mongoose.model('Post', postSchema);
module.exports = Post;