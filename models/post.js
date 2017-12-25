var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var markdown = require('markdown').markdown;
var ObjectId = require('mongodb').ObjectId;
function Post(name, head, title, tags, post) {
  this.name = name;
  this.head = head;
  this.title = title;
  this.tags = tags;
  this.post = post;
}
module.exports = Post;
//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
    date: date,
    year : date.getFullYear(),
    month : date.getFullYear() + "-" + (date.getMonth() + 1),
    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
    date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  }
  //要存入数据库的文档
  var post = {
    name: this.name,
    head: this.head,
    time: time,
    title:this.title,
    post: this.post,
    tags: this.tags,
    repost_info: {},
    comments: [],
    pv: 0
  };
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("postsave:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    } 
    //将文档插入 posts 集合
    collection.insert(post, {safe: true}, function (err) {
      client.close();
      if (err) {
      return callback(err);//失败！返回 err
      }
      callback(null);//返回 err 为 null
    });
  });
};

//读取文章及其相关信息
Post.getTen = function(name,page,callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("getTen:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    var query = {};
    if (name) {
      query.name = name;
    }
    //使用 count 返回特定查询的文档数 total
    collection.count(query, function (err, total) {
      //根据 query 对象查询文章
      collection.find(query,{skip: (page - 1)*10,limit: 10})
        .sort({time: -1})
        .toArray(function (err, docs) {
          console.log(docs);
        client.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        //解析 markdown 为 html
        docs.forEach(function (doc) {
          doc.post = markdown.toHTML(doc.post.replace(/\\r\\n/g,"\n"),"Maruku");
        });
        callback(null, docs,total);//成功！以数组形式返回查询的结果
      });
    });
  });
};
//获取一篇文章
Post.getOne = function(_id, callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("getOne:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //根据用户名、发表日期及文章名进行查询
    collection.findOne({"_id":new ObjectId(_id)}, function (err, doc) {
      if (err) {
        console.log("now findOne callback err!");
        return callback(err);
      } 
      console.log("mongodb find _id:"+_id+":::"+doc) ;  
      if (doc) {
        //每访问 1 次，pv 值增加 1
        collection.update({"_id":new ObjectId(_id)}, {$inc: {"pv": 1}}, function (err) {
          client.close();
          if (err) {
            console.log("now update callback err!");
            return callback(err);
          }
        });
        //解析 markdown 为 html
        console.log("getOne::::rn"+doc.post.indexOf("\r\n"));
        console.log("getOne::::rn"+doc.post.indexOf("\n"));
        console.log(doc.post);
        doc.post = markdown.toHTML(doc.post.replace(/\\r\\n/g,"\n"),"Maruku");
        doc.comments.forEach(function (comment) {
          comment.content = markdown.toHTML(comment.content.replace(/\\r\\n/g,"\n"),"Maruku");
        });
      }
      console.log("now getOne callback null,doc!");
      callback(null, doc);//返回查询的一篇文章
    });
  });
};
//返回原始发表的内容（markdown 格式）
Post.edit = function(_id, callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("postedit:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //根据用户名、发表日期及文章名进行查询
    collection.findOne({"_id":new ObjectId(_id)}, function (err, doc) {
      client.close();
      if (err) {
        return callback(err);
      }
      callback(null, doc);//返回查询的一篇文章（markdown 格式）
    });
  });
};
//更新一篇文章及其相关信息
Post.update = function(_id,update, callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("postupdate:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //更新文章内容
    console.log(update.title+update.tags+"begin update!");
    collection.update({"_id":new ObjectId(_id)}, {$set: {post: update.post,title:update.title,
      tags:update.tags}}, function (err) {
      client.close();
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  });
};
//删除一篇文章
Post.remove = function(_id, callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("postremove:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //查询要删除的文档
    collection.findOne({"_id":new ObjectId(_id)}, function (err, doc) {
      if (err) {
        client.close();
        return callback(err);
      }
      //如果有 repost_from，即该文章是转载来的，先保存下来 repost_from
      var repost_from = "";
      if (doc.repost_info.repost_from) {
        repost_from = doc.repost_info.repost_from;
      }
      if (repost_from != "") {
        //更新原文章所在文档的 repost_to
        collection.update({"name": repost_from.name,"time.day": repost_from.day,"title": repost_from.title
          }, {$pull: {"repost_info.repost_to": {"_id":new ObjectId(_id) ,"name": doc.name,"day": doc.time.day,"title": doc.title}}
          }, function (err) {
          if (err) {
            client.close();
            return callback(err);
          }
        });
      }
      //根据用户名、日期和标题查找并删除一篇文章
      collection.remove({"_id":new ObjectId(_id)}, {w: 1}, function (err) {
        client.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};
//返回所有文章存档信息
Post.getArchive = function(callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("postgetArchive:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //返回只包含 name、time、title 属性的文档组成的存档数组
    collection.find({}, {"name": 1,"time": 1,"title": 1})
      .sort({time: -1})
      .toArray(function (err, docs) {
        client.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
    });
  });
};
//返回所有标签
Post.getTags = function(callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("postgetTags:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //distinct 用来找出给定键的所有不同值
    collection.distinct("tags", function (err, docs) {
      client.close();
      if (err) {
        return callback(err);
      }
      callback(null, docs);
    });
  });
};
//返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("postgetTag:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //查询所有 tags 数组内包含 tag 的文档
    //并返回只含有 name、time、title 组成的数组
    collection.find({"tags": tag}, {"name": 1,"time": 1,"title": 1})
      .sort({ time: -1})
      .toArray(function (err, docs) {
      client.close();
      if (err) {
        return callback(err);
      }
      callback(null, docs);
    });
  });
};
//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("postsearch:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    var pattern = new RegExp(keyword, "i");
    collection.find({"title": pattern}, {"name": 1,"time": 1,"title": 1})
      .sort({time: -1})
      .toArray(function (err, docs) {
      client.close();
      if (err) {
        return callback(err);
      }
      callback(null, docs);
    });
  });
};
//转载一篇文章
Post.repost = function(repost_from, repost_to, callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("postrepost:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //找到被转载的文章的原文档
    collection.findOne({"name": repost_from.name,"time.day": repost_from.day,"title": repost_from.title
      }, function (err, doc) {
      if (err) {
      client.close();
      return callback(err);
      }
      console.log(doc.title);
      console.log(doc.title.search(/\[转载\]/) > -1);
      doc.title = (doc.title.search(/\[转载\]/) > -1) ? doc.title : "[转载]" + doc.title;
      doc.comments = [];
      doc.repost_info = {"repost_from": repost_from};
      doc.pv = 0;
      var date = new Date();
      var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
      }
      //更新被转载的原文档的 repost_info 内的 repost_to
      collection.update({"name": repost_from.name, "time.day": repost_from.day,"title": repost_from.title
      }, {$push: { "repost_info.repost_to": {"_id":new ObjectId(doc["_id"]) ,"name": doc.name,"day": time.day,"title": doc.title}}
      }, function (err) {
        if (err) {
        client.close();
        return callback(err);
        }
      });
      delete doc._id;//注意要删掉原来的 _id
      doc.name = repost_to.name;
      doc.head = repost_to.head;
      doc.time = time;
      console.log("begin insert");
      //将转载生成的副本修改后存入数据库，并返回存储后的文档
      collection.insert(doc, {safe: true}, function (err, result) {
        client.close();
        if (err) {
          return callback(err);
        }
        //console.log(post);
        callback(null, result.ops[0]);
      });
    });
  });
};

Post.getOnenomark = function(_id, callback) {
  //打开数据库
  MongoClient.connect(settings.url,function (err, client) {
    console.log("getOne:Connected correctly to server");
    var db = client.db("blog");
    var collection = db.collection('posts'); 
    //读取 posts 集合
    if(collection == undefined){
       client.db.createCollection("posts");
       console.log("createCollection posts ok!");
    }
    //根据用户名、发表日期及文章名进行查询
    collection.findOne({"_id":new ObjectId(_id)}, function (err, doc) {
      if (err) {
        console.log("now findOne callback err!");
        return callback(err);
      } 
      console.log("mongodb find _id:"+_id+":::"+doc) ;  
      if (doc) {
        //每访问 1 次，pv 值增加 1
        collection.update({"_id":new ObjectId(_id)}, {$inc: {"pv": 1}}, function (err) {
          client.close();
          if (err) {
            console.log("now update callback err!");
            return callback(err);
          }
        });
        //解析 markdown 为 html
      //  doc.post = markdown.toHTML(doc.post);
       // doc.comments.forEach(function (comment) {
      //    comment.content = markdown.toHTML(comment.content);
      //  });
      }
      console.log("now getOne callback null,doc!");
      callback(null, doc);//返回查询的一篇文章
    });
  });
};