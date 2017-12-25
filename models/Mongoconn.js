//var settings = require('../settings');
//Db = require('mongodb').Db,
//Connection = require('mongodb').Connection,
//Server = require('mongodb').Server;
MongoClient = require('mongodb').MongoClient;
var Mongoconn=MongoClient.connect;
module.exports = Mongoconn;