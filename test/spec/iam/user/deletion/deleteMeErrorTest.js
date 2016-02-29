describe('In IAM module', function () {
  describe('while testing delete me', function () {
    var corbelDriver
    var corbelDefaultDriver
    var user

    beforeEach(function (done) {
      corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone()
      corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()

      corbelTest.common.iam.createUsers(corbelDriver, 1)
        .should.be.eventually.fulfilled
        .then(function (createdUsers) {
          user = createdUsers[0]

          return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('an error is returned while trying to get user with the same driver after use deleteMe', function (done) {
      corbelDriver.iam.user()
        .deleteMe()
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.iam.user(user.id)
            .get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'invalid_token')
        })
        .should.notify(done)
    })

    it('an error is returned while trying to use deleteMe with another logged driver', function (done) {
      corbelDefaultDriver.iam.user()
        .deleteMe()
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'unauthorized_token')
        })
        .then(function () {
          return corbelDriver.iam.user()
            .deleteMe()
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return corbelDriver.iam.user(user.id)
            .get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'invalid_token')
        })
        .should.notify(done)
    })
  })
})
