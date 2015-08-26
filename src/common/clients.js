'use strict';

  var drivers = {};
  var tokens = {};
  var logins = {};

  /**
   * Create a new driver with the clientName creadentials.
   * clientName credentials (corbelTest.CONFIG) are generated from .corbeltest config file or ENV variables
   * @param  {string}       clientName clientName configuration to log with
   * @return {corbelDriver} corbelDriver already autenticated
   */
  function login(clientName) {
    if (!drivers[clientName]) {
      var driverConfig = corbelTest.getConfig(clientName);
      var savedConfig;
      try {
        savedConfig = JSON.parse(window.localStorage.getItem('driverconfig'));
      } catch (e) {
        console.warn('warn:parse:savedconfig');
        savedConfig = {};
      }

      // Generate a driver config between descriptor and user saved config
      driverConfig = _.extend(_.clone(driverConfig), savedConfig);
      drivers[clientName] = corbel.getDriver(driverConfig);
      var params = null;
      if (driverConfig.username && driverConfig.password) {
        params = {
          claims: {
            'basic_auth.username': driverConfig.username,
            'basic_auth.password': driverConfig.password,
            'scope': driverConfig.scopes
          }
        };
      }
      logins[clientName] = drivers[clientName].iam.token().create(params);
    }
    return logins[clientName].then(function(response){
      tokens[clientName] = response.data;
    });
  }

  /**
   * Login with all `*_CLIENT` + `*_USER` defined in `.corbeltest`
   * @return {Promise} A promise that resolves when all different clients/users are logged
   */
  function loginAll() {
    var promises = [];

    Object.keys(corbelTest.CONFIG).forEach(function(clientName) {
      if (clientName.indexOf('_CLIENT') !== -1 || clientName.indexOf('_USER') !== -1) {
        promises.push(login(clientName));
      }
    });

    return Promise.all(promises);
  }


module.exports = {
  login : login, 
  loginAll : loginAll,
  drivers : drivers,
  logins : logins,
  tokens : tokens
};