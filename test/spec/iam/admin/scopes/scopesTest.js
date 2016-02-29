describe('In IAM module', function () {
  describe('when performing scopes CRUD operations', function () {
    var corbelDriver
    var scopeId

    before(function () {
      corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone()
    })

    beforeEach(function () {
      scopeId = 'TestScope' + Date.now()
    })

    it('a scope can be created', function (done) {
      var scope = corbelTest.common.iam.getScope(scopeId)

      corbelDriver.iam.scope()
        .create(scope)
        .should.be.eventually.fulfilled
        .then(function (id) {
          expect(id).to.be.equals(scope.id)

          return corbelDriver.iam.scope(scope.id)
            .get()
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.id', scope.id)
          expect(response).to.have.deep.property('data.audience', scope.audience)
          expect(response).to.have.deep.property('data.rules[0].testRule', scope.rules[0].testRule)
          expect(response).to.have.deep.property('data.parameters.a', scope.parameters.a)

          return corbelDriver.iam.scope(scope.id)
            .remove()
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('a scope can be removed', function (done) {
      var scope = corbelTest.common.iam.getScope(scopeId)

      corbelDriver.iam.scope()
        .create(scope)
        .should.be.eventually.fulfilled
        .then(function (id) {
          return corbelDriver.iam.scope(scope.id)
            .remove()
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return corbelDriver.iam.scope(scope.id)
            .get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })
  })
})
