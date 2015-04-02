
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var models = require('./models');

var http = require('http');
var path = require('path');
var multiparty = require('multiparty');

var app = express();

// all environments
app.set('port', process.env.PORT || 8880);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon(path.join(__dirname, 'public/img/logo.ico')));
app.use(express.logger('dev'));
//更新后的express没有
//app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());

app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
//*********************************
app.use(express.cookieParser());
app.use(express.session({ secret: 'my secret'}));

app.use(app.router);

var userModel = models.userModel;

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});