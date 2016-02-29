describe('In IAM module', function () {
  var corbelRootDriver
  before(function () {
    corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone()
  })

  describe('while testing unauthorized errors in devices', function () {
    var userId
    var corbelDriver
    var random
    var user = {
      'firstName': 'userGet',
      'email': 'user.get.',
      'username': 'user.get.',
      'password': 'pass'
    }
    var device = {
      notificationUri: '123',
      uid: '123',
      name: 'device',
      type: 'Android',
      notificationEnabled: true
    }
    var emailDomain = '@funkifake.com'

    beforeEach(function (done) {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()
      random = Date.now()

      corbelDriver.iam.users()
        .create({
          'firstName': user.firstName + random,
          'email': user.email + random + emailDomain,
          'username': user.username + random + emailDomain,
          'password': user.password
        })
        .should.be.eventually.fulfilled
        .then(function (id) {
          userId = id

          return corbelTest.common.clients.loginUser(corbelDriver, user.username + random + emailDomain, user.password)
            .should.eventually.be.fulfilled
        })
        .should.notify(done)
    })

    afterEach(function (done) {
      corbelRootDriver.iam.user(userId)
        .delete()
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelRootDriver.iam.user(userId)
            .get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })

    it('fails with 401 when request register user devices', function (done) {
      corbelDriver.iam.user(userId)
        .registerDevice(device)
        .should.eventually.be.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'unauthorized_token')
        })
        .should.notify(done)
    })

    it('fails with 401 when request retrieve user devices with access token not admin', function (done) {
      corbelDriver.iam.user(userId)
        .getDevices()
        .should.eventually.be.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'unauthorized_token')
        })
        .should.notify(done)
    })

    it('fails with 401 when request retrieve a specific user decive with not admin access token', function (done) {
      corbelDriver.iam.user(userId)
        .getDevice('randomDeviceId')
        .should.eventually.be.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'unauthorized_token')
        })
        .should.notify(done)
    })
  })
})
