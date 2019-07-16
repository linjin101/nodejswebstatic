/**
 express默认项目
 启动命令行
 安装所有依赖包：
 $ cd myapp
 $ npm install
 在 MacOS 或 Linux 中，通过如下命令启动此应用：
 $ DEBUG=nodejsweb:server & npm start
 在 Windows 中，通过如下命令启动此应用：
 set DEBUG=nodejsweb:server & npm start
 然后在浏览器中打开 http://localhost:3000/ 网址就可以看到这个应用了。
 * @type {module:http}
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
