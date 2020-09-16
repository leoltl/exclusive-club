var createError = require('http-errors'),
    express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    session = require('express-session'),
    flash = require('connect-flash');

var config = require('./config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// setup middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// setup mongo session store and use express session
var MongoStore = require('connect-mongo')(session);
var sessionsDBConn = require('./config/dbsetup')(config.get('MONGO_URI'));
app.use(session({
  ...config.get('session-config'), 
  secret: config.get('session-secret'),
  store: new MongoStore({ mongooseConnection: sessionsDBConn }),
}));
app.use(flash());

// setup seperated connection for model queries
var modelsDBConn = require('./config/dbsetup')(config.get('MONGO_URI'));
var User = require('./models/user.model')(modelsDBConn);

// setup and initialize passport
var passport = require('./config/passport-local')(User.findOne.bind(User));
app.use(passport.initialize());
app.use(passport.session());

// set authUser middleware
app.use((req, res, next) => {
  res.locals.authUser = req.user;
  next();
})

// set app name available to view templates
app.use((req, res, next) => {
  res.locals.appname = 'Exclusive.club'
  next();
});

// import and hook up rest of models -> controllers and controllers -> router
var userController = require('./controllers/user.controller')(User, passport);
var postModel = require('./models/post.model')(modelsDBConn);
var postController = require('./controllers/post.controller')(postModel);

var authRouter = require('./routes/auth').makeRouter(userController);
var indexRouter = require('./routes/index').makeRouter(postController);
var userRouter = require('./routes/user').makeRouter(userController);

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/users', userRouter);

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
