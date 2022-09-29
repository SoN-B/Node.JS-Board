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

// update
router.put("/:id", util.isLoggedin, checkPermission, checkPostId, function (req, res) {
    var post = res.locals.post;

    req.body.updatedAt = Date.now();
    Comment.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true }, function (err, comment) {
        if (err) {
            req.flash("commentForm", { _id: req.params.id, form: req.body });
            req.flash("commentError", { _id: req.params.id, errors: util.parseError(err) });
            // comment는 post와 다르게 하나의 페이지에 여러가지 edit form이 존재하기 때문에 정확히 어느 form에서 에러가 왔는지를 나타내 줘야함
        }
        return res.redirect("/posts/" + post._id + res.locals.getPostQueryString());
    });
});
//runValidators: findOneAndUpdate는 기본설정이 schema에 있는 validation을 작동하지 않도록 되어 있기때문에
//이 option을 통해서 validation이 작동하도록 설정해 주어야 합니다.

// destroy
router.delete("/:id", util.isLoggedin, checkPermission, checkPostId, function (req, res) {
    var post = res.locals.post;

    Comment.findOne({ _id: req.params.id }, function (err, comment) {
        // 완전히 삭제 X
        if (err) return res.json(err);

        // save updated comment
        comment.isDeleted = true; // 댓글의 대댓글들 - 고아 방지
        comment.save(function (err, comment) {
            if (err) return res.json(err);

            return res.redirect("/posts/" + post._id + res.locals.getPostQueryString());
        });
    });
});

// private functions
function checkPermission(req, res, next) {
    Comment.findOne({ _id: req.params.id }, function (err, comment) {
        if (err) return res.json(err);
        if (comment.author != req.user.id) return util.noPermission(req, res);
        // 댓글작성자 <=> 현재사용자 체크

        next();
    });
}

function checkPostId(req, res, next) {
    Post.findOne({ _id: req.query.postId }, function (err, post) {
        if (err) return res.json(err);

        res.locals.post = post;
        next();
    });
}

module.exports = router;
