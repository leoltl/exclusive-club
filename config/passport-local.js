const passport = require('passport');
const { validPassword } = require('../bin/utils');
const { Strategy: LocalStrategy } = require('passport-local');

module.exports = function makePassportWithLocalStrategy(findUserFromDB) {
  function localStrategyImplementation(username, password, done) {
    findUserFromDB({ email: username }, (error, user) => {
      if (error) {
        return done(error);
      }

      if (!user) {
        return done(null, false, { message: 'Authentication error. Pleaes check your credentials' });
      }

      const isValid = validPassword(password, user.password_hash, user.salt);
      if (isValid) {
        return done(null, user)
      }

      return done(null, false, { message: 'Authentication error. Pleaes check your credentials' });
    });
  }

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      localStrategyImplementation
    )
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    findUserFromDB({ _id: id }).select('-password_hash -salt').exec(function(error, user) {
      done(error, user);
    });
  });

  return passport;
}
