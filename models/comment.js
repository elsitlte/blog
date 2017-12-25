var MongoClient = require('mongodb').MongoClient;
var settings=require('../settings');
var ObjectId = require('mongodb').ObjectId;

function Comment(_id, comment) {
  this._id = _id;
  this.comment = comment;
}
module.exports = Comment;
//存储一条留言信息
Comment.prototype.save = function(callback) {
  var _id = this._id,
  comment = this.comment;
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("save:Connected correctly to server");
    var db=client.db("blog");
    var collection=db.collection('posts'); 
    //读取 posts 集合
    if(collection==undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
    collection.update({
      "_id": new ObjectId(_id),
      }, {
      $push: {"comments": comment}
      } , function (err) {
        client.close();
        if (err) {
         return callback(err);
        }
        callback(null);
    });
  });
};