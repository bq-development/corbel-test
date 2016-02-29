describe('In OAUTH module', function () {
  var corbelDriver
  var oauthCommon

  before(function () {
    corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone()
    oauthCommon = corbelTest.common.oauth
  })

  describe('with a filter that not allows a user with "failedFilterTestUser" username to log in,', function () {
    var timeStamp = Date.now()
    var password = 'passwordTest'

    var userGoodTest = {
      'username': 'goodUserFilterTest' + timeStamp,
      'password': password,
      'email': 'goodUserFilterTest' + timeStamp + '@funkifake.com'
    }

    var userFailTest = {
      'username': 'failedFilterTestUser' + timeStamp,
      'password': password,
      'email': 'failedFilterTestUser' + timeStamp + '@funkifake.com'
    }

    before(function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), corbelDriver.config.config.iamToken.accessToken)
        .create(userGoodTest)
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), corbelDriver.config.config.iamToken.accessToken)
            .create(userFailTest)
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('a user with this username receive an 401 error', function (done) {
      var setCookie = false
      var noRedirect = false

      corbelDriver.oauth
        .authorization(oauthCommon.getClientParamsCode())
        .login(userGoodTest.username, userGoodTest.password, setCookie, noRedirect)
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .authorization(oauthCommon.getClientParamsCode())
            .login(userFailTest.username, userFailTest.password)
            .should.be.eventually.rejected
        })
        .then(function (response) {
          expect(response).to.have.property('status', 401)
          expect(response).to.have.deep.property('data.error', 'unauthorized')
        })
        .should.notify(done)
    })
  })
})
