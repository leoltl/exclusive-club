var express = require('express');
var { authOnlyRoute } = require('./auth');

function makeRouter(UserController) {
  const router = express.Router();

  router.get('/upgrade', authOnlyRoute, UserController.update_get);
  router.post('/upgrade', authOnlyRoute, UserController.update_post);
  router.get('/confirm', authOnlyRoute, UserController.update_confirm_get);
  router.post('/confirm', authOnlyRoute, UserController.update_confirm_post);

  return router;
}

module.exports = {
  makeRouter,
};
