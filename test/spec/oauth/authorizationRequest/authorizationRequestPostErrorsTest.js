describe('In OAUTH module', function () {
  var corbelDriver
  var oauthUserTest
  var oauthCommon
  var setCookie
  var noRedirect

  before(function () {
    corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone()
    oauthCommon = corbelTest.common.oauth
    oauthUserTest = oauthCommon.getOauthUserTestParams()
    setCookie = false
    noRedirect = true
  })

  describe('for authorization requests post error testing, when requests the login', function () {
    it('with an invalid clientOauth, fails with an UNAUTHORIZED (401) error', function (done) {
      var params = {
        clientId: 'fail',
        responseType: 'code',
        redirectUri: oauthCommon.getRequestInfoEndpoint()
      }

      corbelDriver.oauth
        .authorization(params)
        .login(oauthUserTest.username, oauthUserTest.password, setCookie, noRedirect)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 401)
          expect(response).to.have.deep.property('data.error', 'unauthorized')
        })
        .should.notify(done)
    })

    it('without client, fails with an missing parameter error', function (done) {
      var params = {
        responseType: 'code',
        redirectUri: oauthCommon.getRequestInfoEndpoint()
      }

      oauthCommon
        .lowLevelPostAuthorizationRequest(corbelDriver, params, oauthUserTest.username, oauthUserTest.password)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })

    it('and password is invalid, fails with an UNAUTHORIZED (401) error', function (done) {
      corbelDriver.oauth
        .authorization(oauthCommon.getClientParamsCode())
        .login(oauthUserTest.username, oauthUserTest.password + 'fail', setCookie, noRedirect)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 401)
        })
        .should.notify(done)
    })

    it('and password is missing, fails with a missing parameter error', function (done) {
      corbelDriver.oauth
        .authorization(oauthCommon.getClientParamsCode())
        .login(oauthUserTest.username, null, setCookie, noRedirect)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })

    it('and username is invalid, fails with an UNAUTHORIZED (401) error', function (done) {
      corbelDriver.oauth
        .authorization(oauthCommon.getClientParamsCode())
        .login(oauthUserTest.username + 'fail', oauthUserTest.password, setCookie, noRedirect)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 401)
        })
        .should.notify(done)
    })

    it('and username is missing, fails with a missing parameter error', function (done) {
      var params = {
        clientId: oauthUserTest.clientId,
        responseType: 'code',
        redirectUri: oauthCommon.getRequestInfoEndpoint()
      }

      corbelDriver.oauth
        .authorization(params)
        .login(undefined, oauthUserTest.password, setCookie, noRedirect)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
          expect(response).to.have.deep.property('data.errorDescription', 'username')
        })
        .should.notify(done)
    })

    it('and credentials are invalid, fails with an UNAUTHORIZED (401) error', function (done) {
      corbelDriver.oauth
        .authorization(oauthCommon.getClientParamsCode())
        .login(oauthUserTest.username + 'fail', oauthUserTest.password + 'fail', setCookie, noRedirect)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 401)
        })
        .should.notify(done)
    })

    it('and password is missing, fails with a missing parameter error', function (done) {
      var params = {
        clientId: oauthUserTest.clientId,
        responseType: 'code',
        redirectUri: oauthCommon.getRequestInfoEndpoint()
      }

      corbelDriver.oauth
        .authorization(params)
        .login('u', null, setCookie, noRedirect)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })

    it('and client is missing, fails with an missing parameter error', function (done) {
      var params = {
        clientId: oauthUserTest.clientId,
        responseType: 'code',
        redirectUri: oauthCommon.getRequestInfoEndpoint()
      }

      corbelDriver.oauth
        .authorization(params)
        .login(undefined, 'p', setCookie, noRedirect)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })

    it('and response type is invalid, fails with an invalid response type error', function (done) {
      var params = {
        clientId: oauthUserTest.clientId,
        responseType: 'fail',
        redirectUri: oauthCommon.getRequestInfoEndpoint()
      }

      oauthCommon
        .lowLevelPostAuthorizationRequest(corbelDriver, params, oauthUserTest.username, oauthUserTest.password)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'invalid_response_type')
        })
        .should.notify(done)
    })

    it('and response type is missing, fails with a missing response type error', function (done) {
      var params = {
        clientId: oauthUserTest.clientId,
        redirectUri: oauthCommon.getRequestInfoEndpoint()
      }

      oauthCommon
        .lowLevelPostAuthorizationRequest(corbelDriver, params, oauthUserTest.username, oauthUserTest.password)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })

    it('and redirect uri is missing, fails with a missing parameter error', function (done) {
      var params = {
        clientId: oauthUserTest.clientId,
        responseType: 'code'
      }

      oauthCommon
        .lowLevelPostAuthorizationRequest(corbelDriver, params, oauthUserTest.username, oauthUserTest.password)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })

    it('and redirect uri is not allowed, fails with an UNAUTHORIZED (401) type error', function (done) {
      var params = {
        clientId: oauthUserTest.clientId,
        responseType: 'code',
        redirectUri: 'ftp://something.com'
      }

      corbelDriver.oauth
        .authorization(params)
        .login(oauthUserTest.username, oauthUserTest.password, setCookie, noRedirect)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 401)
          expect(response).to.have.deep.property('data.error', 'unauthorized')
        })
        .should.notify(done)
    })

    it('without redirect nor state, fails with a missing parameter error', function (done) {
      var params = {
        clientId: oauthUserTest.clientId,
        responseType: 'code'
      }

      oauthCommon
        .lowLevelPostAuthorizationRequest(corbelDriver, params, oauthUserTest.username, oauthUserTest.password)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })

    it('without redirect but with state, fails with a missing parameter error', function (done) {
      var params = {
        clientId: oauthUserTest.clientId,
        responseType: 'code'
      }

      oauthCommon
        .lowLevelPostAuthorizationRequest(corbelDriver, params, oauthUserTest.username,
          oauthUserTest.password, 'client')
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })
  })
})
