// routes/comments.js

var express = require("express");
var router = express.Router();
var Comment = require("../models/Comment");
var Post = require("../models/Post");
var util = require("../util");

// create
router.post("/", util.isLoggedin, checkPostId, function (req, res) {
    var post = res.locals.post;

    req.body.author = req.user._id;
    req.body.post = post._id;

    Comment.create(req.body, function (err, comment) {
        if (err) {
            req.flash("commentForm", { _id: null, form: req.body });
            // comment의 flash들은 post의 flash들과는 다르게 _id 항목를 가지고,
            // form, errors와 같이 하위항목에 실제 form과 errors 데이터를 저장
            // -> view 페이지에 여러개의 form이 생기기 때문 (해당 flash 데이터들이 올바른 form을 찾을 수 있게 하기 위해)
            req.flash("commentError", { _id: null, errors: util.parseError(err) });
        }
        return res.redirect("/posts/" + post._id + res.locals.getPostQueryString());
    });
});

// private functions
function checkPostId(req, res, next) {
    Post.findOne({ _id: req.query.postId }, function (err, post) {
        if (err) return res.json(err);

        res.locals.post = post;
        next();
    });
}

module.exports = router;
