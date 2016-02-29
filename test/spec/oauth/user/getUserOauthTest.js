describe('In OAUTH module', function () {
  describe('testing get operation over a oauth user', function () {
    var corbelDriver
    var oauthCommon
    var oauthAdminUserTest, oauthRootUserTest
    var adminAccessToken
    var accessToken
    var userTest

    before(function () {
      corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone()
      oauthCommon = corbelTest.common.oauth
      oauthAdminUserTest = oauthCommon.getOauthAdminUserParams()
      oauthRootUserTest = oauthCommon.getOauthRootUserParams()
    })

    beforeEach(function (done) {
      var timeStamp = Date.now()
      userTest = {
        'username': 'getUserOauthTest' + timeStamp,
        'password': 'passwordTest',
        'email': 'getUserOauthTes' + timeStamp + '@funkifake.com',
        'avatarUri': 'avatarUriTest'
      }

      oauthCommon
        .getToken(corbelDriver, oauthAdminUserTest.username, oauthAdminUserTest.password)
        .should.be.eventually.fulfilled
        .then(function (response) {
          adminAccessToken = response.data['access_token']
        })
        .should.notify(done)
    })

    it('success returning the user information when request to get user details', function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams())
        .create(userTest)
        .should.be.eventually.fulfilled
        .then(function () {
          return oauthCommon
            .getToken(corbelDriver, userTest.username, userTest.password)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          accessToken = response.data['access_token']
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.email', userTest.email.toLowerCase())
          expect(response).to.have.deep.property('data.username', userTest.username.toLowerCase())

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .delete('me')
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('success returning the userId when request to get userId through username', function (done) {
      var userId

      corbelDriver.oauth
        .user(oauthCommon.getClientParams())
        .create(userTest)
        .should.be.eventually.fulfilled
        .then(function (id) {
          userId = id
          return oauthCommon
            .getToken(corbelDriver, userTest.username, userTest.password)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          accessToken = response.data['access_token']

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .username(userTest.username)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.id', userId)
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .delete('me')
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('404 is returned when request to get userId through nonexistent username', function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), adminAccessToken)
        .username(userTest.username)
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 404)
          expect(response).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })

    it('success returning the user information when request to get user profile', function (done) {
      var userId
      corbelDriver.oauth
        .user(oauthCommon.getClientParams())
        .create(userTest)
        .should.be.eventually.fulfilled
        .then(function (id) {
          userId = id
          return oauthCommon
            .getToken(corbelDriver, userTest.username, userTest.password)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          accessToken = response.data['access_token']
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .getProfile(userId)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.email', userTest.email.toLowerCase())
          expect(response).to.have.deep.property('data.username', userTest.username.toLowerCase())
          expect(response).to.have.deep.property('data.avatarUri', userTest.avatarUri)

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .delete(userId)
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('success returning the user information when request to get user profile of logged user', function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams())
        .create(userTest)
        .should.be.eventually.fulfilled
        .then(function () {
          return oauthCommon
            .getToken(corbelDriver, userTest.username, userTest.password)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          accessToken = response.data['access_token']
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .getProfile('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.email', userTest.email.toLowerCase())
          expect(response).to.have.deep.property('data.username', userTest.username.toLowerCase())
          expect(response).to.have.deep.property('data.avatarUri', userTest.avatarUri)

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .delete('me')
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('success returning the user information when request to get other user details', function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams())
        .create(userTest).should.be.eventually.fulfilled
        .then(function () {
          return oauthCommon
            .getToken(corbelDriver, userTest.username, userTest.password)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          accessToken = response.data['access_token']
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), adminAccessToken)
            .get(response.data.id)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.email', userTest.email.toLowerCase())
          expect(response).to.have.deep.property('data.username', userTest.username.toLowerCase())

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .delete('me')
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('404 is returned when request to get user details from root with an admin', function (done) {
      var rootAccessToken

      oauthCommon
        .getToken(corbelDriver, oauthRootUserTest.username, oauthRootUserTest.password)
        .should.be.eventually.fulfilled
        .then(function (response) {
          rootAccessToken = response.data['access_token']

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), rootAccessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.email', oauthRootUserTest.email)
          expect(response).to.have.deep.property('data.username', oauthRootUserTest.username)

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), adminAccessToken)
            .get(response.data.id)
            .should.be.eventually.rejected
        })
        .then(function (response) {
          expect(response).to.have.property('status', 404)
        })
        .should.notify(done)
    })

    it('401 is returned when request to get user details and user not exist', function (done) {
      return corbelDriver.oauth
        .user(oauthCommon.getClientParams(), 'BAD ACCESS TOKEN')
        .get('me')
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 401)
        })
        .should.notify(done)
    })
  })
})
