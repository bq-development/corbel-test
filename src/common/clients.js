'use strict'

var drivers = {}
var tokens = {}
var logins = {}

/**
 * Create a new driver with the clientName creadentials.
 * clientName credentials (corbelTest.CONFIG) are generated from .corbeltest config file or ENV variables
 * @param  {string}       clientName clientName configuration to log with
 * @return {corbelDriver} corbelDriver already autenticated
 */
function login (clientName) {
  if (!drivers[clientName]) {
    var driverConfig = corbelTest.getConfig(clientName)
    var savedConfig
    try {
      savedConfig = JSON.parse(window.localStorage.getItem('driverconfig'))
    } catch (e) {
      console.warn('warn:parse:savedconfig')
      savedConfig = {}
    }

    // Generate a driver config between descriptor and user saved config
    driverConfig = _.extend(_.clone(driverConfig), savedConfig)
    drivers[clientName] = corbel.getDriver(driverConfig)
    var params = null
    if (driverConfig.username && driverConfig.password) {
      params = {
        claims: {
          'basic_auth.username': driverConfig.username,
          'basic_auth.password': driverConfig.password,
          'scope': driverConfig.scopes
        }
      }
    }
    logins[clientName] = drivers[clientName].iam.token().create(params)
  }
  return logins[clientName].then(function (response) {
    tokens[clientName] = response.data
  })
}

/**
 * Login with all `*_CLIENT` + `*_USER` defined in `.corbeltest`
 * @return {Promise} A promise that resolves when all different clients/users are logged
 */
function loginAll () {
  var promises = []

  Object.keys(corbelTest.CONFIG).forEach(function (clientName) {
    if (clientName.indexOf('_CLIENT') !== -1 || clientName.indexOf('_USER') !== -1) {
      promises.push(login(clientName))
    }
  })

  return Promise.all(promises)
}

function loginAsRandomUser () {
  var createDriver = arguments[0]
  var loginDriver = arguments[1] || createDriver
  var iamUtils = require('./iam')
  var user
  return iamUtils.createUsers(createDriver, 1).then(function (users) {
    // default client scopes
    user = users[0]
    var params = {
      claims: {
        'basic_auth.username': user.username,
        'basic_auth.password': user.password
      }
    }
    return loginDriver.iam.token().create(params)
  }).then(function (response) {
    return {
      token: response.data,
      user: user
    }
  })
}

function loginUser (driver, username, password, deviceId) {
  var params = {
    claims: {
      'basic_auth.username': username,
      'basic_auth.password': password
    }
  }
  if (deviceId) {
    params.claims['device_id'] = deviceId
  }

  return driver.iam.token().create(params)
}

module.exports = {
  login: login,
  loginAll: loginAll,
  loginAsRandomUser: loginAsRandomUser,
  loginUser: loginUser,
  drivers: drivers,
  logins: logins,
  tokens: tokens
}
