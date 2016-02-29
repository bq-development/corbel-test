describe('In OAUTH module', function () {
  var corbelDriver
  var oauthCommon

  before(function () {
    corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone()
    oauthCommon = corbelTest.common.oauth
  })

  describe('user management', function () {
    it('allows CRUD flow over user', function (done) {
      var code, accessToken
      var timeStamp = Date.now()

      var username = 'createUserTest' + timeStamp
      var updateUsername = 'updateCreateUserTest' + timeStamp
      var password = 'passwordTest'
      var updatePassword = 'updatePasswordTest'
      var email = 'createUserTest' + timeStamp + '@funkifake.com'

      var userTest = {
        'username': username,
        'password': password,
        'email': email
      }

      corbelDriver.oauth
        .user(oauthCommon.getClientParams()).create(userTest)
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .authorization(oauthCommon.getClientParamsCode())
            .login(username, password)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response.data.query.code).to.be.match(oauthCommon.getTokenValidation())
          code = response.data.query.code

          return corbelDriver.oauth
            .token(oauthCommon.getClientParamsToken())
            .get(code)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response.data['access_token']).to.be.match(oauthCommon.getTokenValidation())
          accessToken = response.data['access_token']

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.username', username.toLowerCase())
          expect(response).to.have.deep.property('data.email', email.toLowerCase())
          var updateUserData = {
            'username': updateUsername,
            'password': updatePassword
          }

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .update('me', updateUserData)
        })
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .authorization(oauthCommon.getClientParamsCode())
            .login(updateUsername, updatePassword)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          code = response.data.query.code
          expect(code).to.be.match(oauthCommon.getTokenValidation())
          return corbelDriver.oauth
            .token(oauthCommon.getClientParamsToken())
            .get(code)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          accessToken = response.data['access_token']
          expect(accessToken).to.be.match(oauthCommon.getTokenValidation())

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.username', updateUsername.toLowerCase())
          expect(response).to.have.deep.property('data.email', email.toLowerCase())

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .delete('me')
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return corbelDriver.oauth
            .authorization(oauthCommon.getClientParamsCode())
            .login(updateUsername, updatePassword)
            .should.be.eventually.rejected
        })
        .should.notify(done)
    })
  })
})
