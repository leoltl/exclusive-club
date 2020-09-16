const { body, validationResult } = require('express-validator');

module.exports = function makeController(PostModel) {
  function create_get(req, res) {
    res.render('new_post');
  }

  const create_post = [
    body('*').trim().escape(),   
    body('title').isLength(1),
    body('body').exists(),

    async function(req, res, next) {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.render('new_post', {
          filled: req.body,
        })
      }

      const post = new PostModel({
        title: req.body.title,
        body: req.body.body,
        user: req.user._id,
      });

      try {
        await post.save();
        res.redirect('/');
      } catch(e) {
        next(e);
      }
    }
  ];

  async function list(req, res, next) {
    const errorMsg = req.flash('error');
    const infoMsg = req.flash('info');
    try {
      const query = req.user && req.user.role == 'admin' ? {} : { deleted: false };
      const posts = await PostModel.find(query).limit(20).populate('user', '-password_hash -salt');
      res.render('index', {
        posts,
        flashMsg: [...errorMsg,...infoMsg]
      });
    } catch (e) {
      next(e);
    }
  }

  async function delete_post(req, res, next) {
    const DELETE_ACTION = {
      delete: true,
      undelete: false,
    } 
    try {
      const { id, action } = req.params;
      if (DELETE_ACTION[action] !== undefined ) {
        await PostModel.findOneAndUpdate({ _id: id }, { deleted: DELETE_ACTION[action], last_modified_by: req.user._id, updated_at: Date.now() })
      }
      res.redirect('/')
    } catch (e) {
      next(e);
    }
  }

  return {
    create_get,
    create_post,
    list,
    delete_post,
  }
}
