var express = require('express');

function noAuthOnlyRoute(req, res, next) {
  if (req.isAuthenticated()) {
    req.flash('info', 'You have already authenticated.');
    return res.redirect('/');
  }
  return next();
}

function authOnlyRoute(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Authenticated users only, please sign in to proceed');
  return res.redirect('/sign-in');
}

function authorize(roles) {
  let _roles
  if (!Array.isArray(roles)) {
    _roles = [roles];
  } else {
    _roles = roles;
  }

  return function (req, res, next) {
    if (_roles.includes(req.user.role) || _roles.includes(req.user.membership_status)) {
      return next();
    }
    req.flash('error', 'You are not authorize. Consider upgrade your membership to get this feature.');
  return res.redirect('/');
  }
}

function makeRouter(UserController) {
  const router = express.Router();

  router.get('/register', noAuthOnlyRoute, UserController.create_get);
  router.post('/register', noAuthOnlyRoute, UserController.create_post);

  router.get('/sign-in', noAuthOnlyRoute, UserController.signin_get);
  router.post('/sign-in', noAuthOnlyRoute, UserController.signin_post);

  router.get('/sign-out', UserController.signout_post);

  return router;
}

module.exports = {
  makeRouter,
  authOnlyRoute,
  noAuthOnlyRoute,
  authorize,
};
