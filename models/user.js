var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var crypto = require('crypto');


function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};
module.exports = User;
//存储用户信息
User.prototype.save = function(callback) {
  var md5 = crypto.createHash('md5');
  var email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
  var head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
  //要存入数据库的用户文档
  var user = {
    name: this.name,
    password: this.password,
    email: this.email,
    head: head
  };

  MongoClient.connect(settings.url,function(err, client) {
    console.log("save:Connected correctly to server");
    //读取 users 集合
    var db = client.db("blog");
    var collection = db.collection('users'); 
    //将用户数据插入 users 集合
    collection.insert(user, {safe: true}, function (err, user) {
        client.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, user[0]);//成功！err 为 null，并返回存储后的用户文档
        client.close();
      });
    console.log("insert ok!");
  });
};
//读取用户信息
User.get = function(name, callback) {

  MongoClient.connect(settings.url,function(err, client) {
   // assert.equal(null, err);
    console.log("get:Connected correctly to server!");
    //读取 users 集合
    var db = client.db("blog");
    var collection = db.collection('users');
    if(collection == undefined){
       client.db.createCollection("users");
       console.log("createCollection ok!");
    }      
    //查找用户名（name键）值为 name 一个文档
    collection.findOne({name: name}, function (err, user) {
      console.log("get:infindOne！");
      if (err) {
        client.close();
        return callback(err);//失败！返回 err 信息
      }
      callback(null, user);//成功！返回查询的用户信息
      });
  });
};