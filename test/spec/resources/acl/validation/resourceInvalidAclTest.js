describe('In RESOURCES module', function () {
  describe('In ACL module', function () {
    describe('while testing ACL permission validations', function () {
      var corbelAdminDriver
      var corbelRootDriver
      var COLLECTION_NAME = 'test:testAcl' + Date.now()
      var DOMAIN = 'silkroad-qa'
      var adminUser
      var resourceId
      var random
      var usersId
      var TEST_OBJECT

      before(function (done) {
        corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone()
        corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone()
        random = Date.now()
        usersId = []
        TEST_OBJECT = {
          test: 'test' + random,
          test2: 'test2' + random
        }

        corbelTest.common.resources.setManagedCollection(
          corbelRootDriver, DOMAIN, COLLECTION_NAME)
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
              .should.be.eventually.fulfilled
          })
          .then(function (createdUser) {
            adminUser = createdUser[0]
            usersId.push(adminUser.id)

            return corbelTest.common.clients.loginUser(
              corbelAdminDriver, adminUser.username, adminUser.password)
              .should.be.eventually.fulfilled
          })
          .then(function () {
            return corbelAdminDriver.resources.collection(COLLECTION_NAME)
              .add(TEST_OBJECT)
              .should.be.eventually.fulfilled
          })
          .then(function (id) {
            resourceId = id
          })
          .should.notify(done)
      })

      after(function (done) {
        corbelTest.common.resources.unsetManagedCollection(
          corbelRootDriver, DOMAIN, COLLECTION_NAME)
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
              .delete()
              .should.be.eventually.fulfilled
          })
          .then(function () {
            var promises = usersId.map(function (userId) {
              return corbelRootDriver.iam.user(userId)
                .delete()
                .should.be.eventually.fulfilled
            })

            return Promise.all(promises)
          })
          .should.notify(done)
      })

      it('an error 422 is returned when trying to update an ACL resource with string data', function (done) {
        var ACL = 'invalid'

        corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
          .update(ACL, {dataType: 'application/corbel.acl+json'})
          .should.be.eventually.rejected
          .then(function (e) {
            expect(e).to.have.property('status', 422)
            expect(e).to.have.deep.property('data.error', 'invalid_entity')
          })
          .should.notify(done)
      })
    })
  })
})
