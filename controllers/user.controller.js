const { body, validationResult } = require('express-validator');
const { genPassword } = require('../bin/utils');
const nconf = require('nconf');

module.exports = function makeController(UserModel, passport) {
  function create_get(req, res, next) {
    res.render('register');
  }

  async function _checkEmailExists(email) {
    try {
      let user = await UserModel.findOne({ email });
      if (user === null) {
        return Promise.resolve();
      }
      return Promise.reject();
    } catch(e) {
      console.log(e);
      return Promise.reject();
    }
  };

  const create_user_validation = [
    body('*')
      .trim().escape(),
    body('first_name')
      .isLength(1).withMessage('First name is required.'),
    body('last_name')
      .isLength(1).withMessage('Last name is required.'),
    body('email')
      .isEmail().withMessage('Email should be a valid email address.').bail()
      .custom(_checkEmailExists).withMessage('Email has been used for other account')
      .normalizeEmail(),
    body('password')
      .isLength(6).withMessage('Password has to be longer than 6 characters'),
    body('password_confirm')
      .custom((value, { req }) => value === req.body.password).withMessage('Password and password confirm field do not match.'),
  ];

  const create_post = [
    ...create_user_validation,
    async function (req, res) {

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const { password, password_confirm, ...restOfBody } = req.body;
        return res.render('register', {
          formErrors: errors.array(),
          filled: restOfBody,
        });
      }

      const [password_hash, salt] = genPassword(req.body.password);
      
      const user = new UserModel({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password_hash,
        salt,
      });

      try {
        await user.save();
        res.redirect('/sign-in');
      } catch (e) {
        next(e);
      }
    },
  ];

  function signin_get(req, res) {
    const flashMsg = req.flash('error');
    res.render('signin', { flashMsg });
  }

  const signin_post = [
    body('*').trim().escape(),
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/sign-in',
      failureFlash: true,
      successFlash: true,
      session: true,
    }),
  ];

  function signout_post(req, res) {
    req.logout();
    res.redirect('/');
  }

  function update_get(req, res) {
    res.render('upgrade');
  }

  function update_post(req, res, next) {
    /* upgrade membership flow:
      set membership upgrade data to session in this route, then send user to upgrade confirmation page. If user enters correct passphrase
      at confirmation page, retrieve the upgrade data back from session store, and then call db update function with the data.
    */
    try {
      const upgradeTo = req.query.to;
      const [shouldUpgrade, howToUpdateRoleToDB] = req.user.shouldandHowToUpgrade(upgradeTo);
      if (shouldUpgrade) {
        const validUntil = new Date(Date.now() + 10 * 60 * 1000); //10 mins from now
        req.session.upgrade = { upgradeTo, validUntil, updateRole: howToUpdateRoleToDB };
        return res.redirect('confirm');
      }

      // otherwise should not upgrade, show error message 
      const flashMsg = howToUpdateRoleToDB ? ['This upgrade is ineligible path'] : ['Cannot process this upgrade at this moment.'];
      const flashMsgType = howToUpdateRoleToDB ? 'Upgrade' : 'Server'
      
      res.render('upgrade', {
        flashMsg,
        flashMsgType
      });
    } catch (e) {
      next(e)
    }
    
  }

  function update_confirm_get(req, res, next) {
    try {
      const { upgradeTo } = req.session.upgrade;
      res.render('confirm', { upgradeTo });
    } catch (e) {
      next(e)
    }
  }

  async function update_confirm_post(req, res, next) {
    try {
      const { upgradeTo, updateRole, validUntil } = req.session.upgrade;
      req.session.upgrade = undefined; // clear upgrade data in session

      const timeValid = new Date() < new Date(validUntil);
      if (timeValid) {
        const passphrase = nconf.get(`${upgradeTo}_passphrase`) || 'yes';
        if (req.body.passphrase === passphrase) {
          // upgrade user if passphrase provided is good and timevalid
          await UserModel.findByIdAndUpdate({ _id: req.user._id }, {
            ...updateRole,
          }, { runValidators: true });
          return res.redirect('/users/upgrade');
        }
      }

      // do not upgrade otherwise, and show error message
      const flashMsg = ['Cannot process your membership upgrade at this moment.'];
      const flashMsgType = 'Server'
      return res.render('upgrade', {
        flashMsg,
        flashMsgType
      });
    } catch (e) {
      console.log(e)
      next(e)
    }
  }

  return {
    create_get,
    create_post,
    signin_get,
    signin_post,
    signout_post,
    update_get,
    update_post,
    update_confirm_get,
    update_confirm_post,
  };
}
