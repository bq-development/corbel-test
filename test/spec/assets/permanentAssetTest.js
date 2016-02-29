describe('In ASSETS module', function () {
  describe('when creating a permanent asset', function () {
    var assetId, user
    var clientCorbelDriver, userCorbelDriver
    var NEW_SCOPES = ['borrow:lender:root']

    beforeEach(function (done) {
      clientCorbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone()
      userCorbelDriver = corbelTest.drivers['ADMIN_USER'].clone()
      corbelTest.common.iam.createUsers(clientCorbelDriver, 1)
        .should.be.eventually.fulfilled
        .then(function (response) {
          user = response[0]
        })
        .should.notify(done)
    })

    after(function (done) {
      userCorbelDriver.assets.asset(assetId).delete()
        .should.be.eventually.fulfilled
        .then(function () {
          return userCorbelDriver.assets.asset(assetId).get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')

          return userCorbelDriver.iam.user(user.id).delete()
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('asset is created and assigned correctly', function (done) {
      var asset = corbelTest.common.assets.getAsset(NEW_SCOPES)
      asset.expire = null
      asset.userId = user.id

      userCorbelDriver.assets.asset().create(asset)
        .should.be.eventually.fulfilled
        .then(function (id) {
          assetId = id

          return userCorbelDriver.assets.asset(assetId).get()
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.id', assetId)
          expect(response).to.have.deep.property('data.userId', user.id)
          expect(response).to.have.deep.property('data.scopes').that.is.an('array').and.contain(NEW_SCOPES[0])
          return corbelTest.common.clients.loginUser(clientCorbelDriver, user.username, user.password)
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return clientCorbelDriver.borrow.lender().getAll()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'unauthorized_token')
          return clientCorbelDriver.assets.asset().access()
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return clientCorbelDriver.borrow.lender().getAll()
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })
  })
})
