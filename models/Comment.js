// models/Comment.js

var mongoose = require("mongoose");

// schema
var commentSchema = mongoose.Schema(
    {
        post: { type: mongoose.Schema.Types.ObjectId, ref: "post", required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "comment" },
        // 자기 자신의 모델을 자신의 항목으로 가지는 것을 self referencing relationship
        text: { type: String, required: [true, "text is required!"] },
        isDeleted: { type: Boolean }, // 고아 방지
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date },
    },
    {
        toObject: { virtuals: true },
    }
);

commentSchema
    .virtual("childComments")
    .get(function () {
        return this._childComments;
    })
    .set(function (value) {
        this._childComments = value;
    });

// model & export
var Comment = mongoose.model("comment", commentSchema);
module.exports = Comment;
