describe('In OAUTH module', function () {
  var corbelDriver
  var oauthUserTest
  var oauthCommon

  before(function () {
    corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone()
    oauthCommon = corbelTest.common.oauth
    oauthUserTest = oauthCommon.getOauthUserTestParams()
  })

  describe('for get authorization request error testing, when requests the login page', function () {
    it('and client is invalid, fails with an UNAUTHORIZED (401) error', function (done) {
      var clientParams = {
        clientId: 'fail',
        responseType: 'code',
        redirectUri: oauthCommon.getURI(corbelDriver, 'iam') + 'oauth/token'
      }

      oauthCommon
        .lowLevelGetAuthorizationRequest(corbelDriver, clientParams)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 401)
          expect(response).to.have.deep.property('data.error', 'unauthorized')
        })
        .should.notify(done)
    })

    it('and client is missing, fails with a missing parameter error ', function (done) {
      var clientParams = {
        responseType: 'code',
        redirectUri: oauthCommon.getURI(corbelDriver, 'iam') + 'oauth/token'
      }

      oauthCommon
        .lowLevelGetAuthorizationRequest(corbelDriver, clientParams)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })

    it('and response_type is invalid, fails with an invalid response type error', function (done) {
      var clientParams = {
        clientId: oauthUserTest.clientId,
        responseType: 'fail',
        redirectUri: oauthCommon.getURI(corbelDriver, 'iam') + 'oauth/token'
      }

      oauthCommon
        .lowLevelGetAuthorizationRequest(corbelDriver, clientParams)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'invalid_response_type')
        })
        .should.notify(done)
    })

    it('and response_type is missing, fails with a missing parameter error', function (done) {
      var clientParams = {
        clientId: oauthUserTest.clientId,
        redirectUri: oauthCommon.getURI(corbelDriver, 'iam') + 'oauth/token'
      }

      oauthCommon
        .lowLevelGetAuthorizationRequest(corbelDriver, clientParams)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })

    it('and redirect uri is not allowed, fails with an UNAUTHORIZED (401) error', function (done) {
      var clientParams = {
        clientId: oauthUserTest.clientId,
        responseType: 'code',
        redirectUri: 'asdf'
      }

      oauthCommon.lowLevelGetAuthorizationRequest(corbelDriver, clientParams)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 401)
          expect(response).to.have.deep.property('data.error', 'unauthorized')
        })
        .should.notify(done)
    })

    it('and response uri is missing, fails with a missing parameter error', function (done) {
      var clientParams = {
        clientId: oauthUserTest.clientId,
        responseType: 'code'
      }

      oauthCommon
        .lowLevelGetAuthorizationRequest(corbelDriver, clientParams)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 400)
          expect(response).to.have.deep.property('data.error', 'missing_parameter')
        })
        .should.notify(done)
    })
  })
})
