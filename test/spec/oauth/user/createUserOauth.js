describe('In OAUTH module', function () {
  var corbelDriver
  var oauthCommon

  before(function () {
    corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone()
    oauthCommon = corbelTest.common.oauth
  })

  describe('when requests to create a new user', function () {
    it('successes with response CREATED (201)', function (done) {
      var token
      var random = Date.now()

      var userTest = {
        'username': 'createUserOauthTest' + random,
        'password': 'passwordTest',
        'email': 'createUserOauthTest' + random + '@funkifake.com'
      }

      corbelDriver.oauth
        .user(oauthCommon.getClientParams())
        .create(userTest)
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .authorization(oauthCommon.getClientParamsCode())
            .login(userTest.username, userTest.password)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          return corbelDriver.oauth
            .token(oauthCommon.getClientParamsToken())
            .get(response.data.query.code)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          token = response.data['access_token']

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), token)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.email', userTest.email.toLowerCase())
          expect(response).to.have.deep.property('data.username', userTest.username.toLowerCase())
          expect(response).to.have.deep.property('data.role', 'USER')

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), token).get('me')
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })
  })
})
