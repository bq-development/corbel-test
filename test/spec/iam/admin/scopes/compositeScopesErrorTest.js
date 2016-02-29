describe('In IAM module', function () {
  describe('when performing composite scopes CRUD operations', function () {
    var corbelRootDriver
    var corbelDefaultDriver

    before(function () {
      corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone()
      corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()
    })

    it('an error 401 is returned when trying to create a composite scope without authorization', function (done) {
      var compositeScope = corbelTest.common.iam.getCompositeScope()

      corbelDefaultDriver.iam.scope()
        .create(compositeScope)
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'unauthorized_token')
        })
        .should.notify(done)
    })

    it("an error 400 is returned when trying to create a composite scope with ';'", function (done) {
      var compositeScope = corbelTest.common.iam.getCompositeScope('TestScope_' + Date.now() + ';')

      corbelRootDriver.iam.scope()
        .create(compositeScope)
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 400)
          expect(e).to.have.deep.property('data.error', 'scope_id_not_allowed')
        })
        .should.notify(done)
    })

    it('an error 422 is returned when trying to create a composite scope with malformed entity', function (done) {
      corbelRootDriver.iam.scope()
        .create('asdf')
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 422)
          expect(e).to.have.deep.property('data.error', 'invalid_entity')
        })
        .should.notify(done)
    })

    it('an error 401 is returned when trying to get a composite scope without authorization', function (done) {
      var compositeScope = corbelTest.common.iam.getCompositeScope()

      corbelRootDriver.iam.scope()
        .create(compositeScope)
        .should.be.eventually.fulfilled
        .then(function (id) {
          return corbelDefaultDriver.iam.scope(id)
            .get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'unauthorized_token')
        })
        .should.notify(done)
    })

    it('an error 404 is returned when trying to get a composite scope which does not exist', function (done) {
      corbelRootDriver.iam.scope('non-existent')
        .get()
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })

    it('an error 401 is returned when trying to delete a composite scope without authorization', function (done) {
      var compositeScope = corbelTest.common.iam.getCompositeScope()

      corbelRootDriver.iam.scope()
        .create(compositeScope)
        .should.be.eventually.fulfilled
        .then(function (id) {
          return corbelDefaultDriver.iam.scope(id)
            .remove()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'unauthorized_token')
        })
        .should.notify(done)
    })
  })
})
