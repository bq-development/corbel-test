(function() {

  corbelTest.getConfig = getConfig;
  corbelTest.login = login;
  corbelTest.loginAll = loginAll;
  corbelTest.drivers = [];
  corbelTest.logins = [];

  /**
   *
   * @param  {string} clientName
   * @return {object} a corbel config object
   */
  function getConfig(clientName) {
    var commonConfig =_.clone(corbelTest.CONFIG['COMMON']);
    if (corbelTest.CONFIG.ENV) {
      commonConfig.urlBase = commonConfig.urlBase.replace('{{ENV}}', corbelTest.CONFIG.ENV);
    }
    return _.extend(commonConfig, corbelTest.CONFIG[clientName]);
  }

  /**
   * Create a new driver with the clientName creadentials.
   * clientName credentials (corbelTest.CONFIG) are generated from .corbeltest config file or ENV variables
   * @param  {string}       clientName clientName configuration to log with
   * @return {corbelDriver} corbelDriver already autenticated
   */
  function login(clientName) {
    if (!corbelTest.drivers[clientName]) {
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
      corbelTest.drivers[clientName] = corbel.getDriver(driverConfig);
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
      corbelTest.logins[clientName] = corbelTest.drivers[clientName].iam.token().create(params);
    }
    return corbelTest.logins[clientName];
  }

  /**
   * Login with all `*_CLIENT` + `*_USER` defined in `.corbeltest`
   * @return {Promise} A promise that resolves when all different clients/users are logged
   */
  function loginAll() {
    var promises = [];

    Object.keys(corbelTest.CONFIG).forEach(function(clientName) {
      if (clientName.indexOf('_CLIENT') !== -1 || clientName.indexOf('_USER') !== -1) {
        promises.push(corbelTest.login(clientName));
      }
    });

    return Promise.all(promises);
  }

})();
