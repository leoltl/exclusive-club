const nconf = require('nconf');
const path = require('path')

function Config() {
  // first load from argv and env variable
  nconf.argv().env();
  const environment = nconf.get('NODE_ENV') || 'development';

  console.log(`Loading config for ${environment} environment...`)
  // load config file based on node_env
  nconf.file('credentials', path.resolve(__dirname, 'config', 'nconf', `credentials-${environment}.json`));
  nconf.file('application-default', path.resolve(__dirname, 'config', 'nconf', 'default.json'));

  return {
    get: function (key) {
      return nconf.get(key);
    }
  }
}

module.exports = Config();
