var express = require('express');
var path = require('path');
var fs = require('fs')
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var settings = require('./settings');
var index = require('./routes/index');
var users = require('./routes/users');

var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
var multer = require('multer');
var app = express();


var upload = multer({ dest: './public/images' }) ;
app.post('/upload',upload.array('file1',5), function (req, res, next) {
  // req.body contains the text fields 
})
/*
app.use(multer({
	dest: './public/images',
	rename: function (fieldname, filename) {
	return filename;
	}
}));*/



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//sessions
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port,
    url:'mongodb://localhost/' + settings.db
  })
}));
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
var errorLogStream = fs.createWriteStream(path.join(__dirname, 'error.log'), {flags: 'a'});
app.use(logger('dev',{stream:accessLogStream}));
app.use(function (err, req, res, next) {
var meta = '[' + new Date() + '] ' + req.url + '\n';
errorLog.write(meta + err.stack + '\n');
next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/u', express.static('public'));
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
