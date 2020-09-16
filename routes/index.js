var express = require('express')
var { authOnlyRoute, authorize } = require('./auth');

function makeRouter(PostController) {
  const router = express.Router();

  router.get('/', PostController.list);

  router.get('/post/new', authOnlyRoute, authorize(['admin', 'active']), PostController.create_get);
  router.post('/post/new', authOnlyRoute, authorize(['admin', 'active']), PostController.create_post);
  router.post('/post/:id/:action', authOnlyRoute, authorize(['admin']), PostController.delete_post);

  return router;
}

module.exports = {
  makeRouter,
};
