describe('In RESOURCES module', function () {
  describe('In RESMI module, testing collection conditions', function () {
    var corbelDriver
    var COLLECTION = 'test:collectionConditions' + Date.now()
    var valueFirst = 'first' + Date.now()
    var valueSecond = 'second' + Date.now()
    var valueThird = 'third' + Date.now()
    var resourceId
    var TEST_OBJECT = {
      test: valueFirst
    }

    beforeEach(function (done) {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()
      corbelDriver.resources.collection(COLLECTION)
        .add(TEST_OBJECT)
        .should.be.eventually.fulfilled
        .then(function (id) {
          resourceId = id
        })
        .should.be.eventually.fulfilled.and.notify(done)
    })

    afterEach(function (done) {
      TEST_OBJECT.test = valueFirst
      corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
        .should.be.eventually.fulfilled
        .should.be.eventually.fulfilled.and.notify(done)
    })

    it('when does conditional update, if the condition is not satisfied must throw an error',
      function (done) {
        var params = {
          condition: [{
            '$eq': {
              test: valueSecond
            }
          }]
        }
        TEST_OBJECT.test = valueSecond

        corbelDriver.resources.resource(COLLECTION, resourceId)
          .update(TEST_OBJECT, params)
          .should.be.eventually.rejected
          .then(function (e) {
            expect(e).to.have.property('status', 412)
            expect(e.data).to.have.property('error', 'precondition_failed')
            var params = {
              conditions: [{
                condition: [{
                  '$eq': {
                    test: valueSecond
                  }
                }]
              }, {
                condition: [{
                  '$eq': {
                    test: valueThird
                  }
                }]
              }]
            }
            TEST_OBJECT.test = valueThird

            return corbelDriver.resources.resource(COLLECTION, resourceId)
              .update(TEST_OBJECT, params)
              .should.be.eventually.rejected
          })
          .then(function (e) {
            expect(e).to.have.property('status', 412)
            expect(e.data).to.have.property('error', 'precondition_failed')
          })
          .should.be.eventually.fulfilled.and.notify(done)
      })

    it('when does conditional update, the condition must be satisfied to update', function (done) {
      var params = {
        condition: [{
          '$eq': {
            test: valueFirst
          }
        }]
      }
      TEST_OBJECT.test = valueSecond

      corbelDriver.resources.resource(COLLECTION, resourceId)
        .update(TEST_OBJECT, params)
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.resources.resource(COLLECTION, resourceId)
            .get()
            .should.be.eventually.fulfilled
        })
        .then(function (resultObject) {
          expect(resultObject.data.test).to.be.equal(valueSecond)
        })
        .then(function () {
          var params = {
            conditions: [{
              condition: [{
                '$eq': {
                  test: valueFirst
                }
              }]
            }, {
              condition: [{
                '$eq': {
                  test: valueSecond
                }
              }]
            }]
          }
          TEST_OBJECT.test = valueThird

          return corbelDriver.resources.resource(COLLECTION, resourceId)
            .update(TEST_OBJECT, params)
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return corbelDriver.resources.resource(COLLECTION, resourceId)
            .get()
            .should.be.eventually.fulfilled
        })
        .then(function (resultObject) {
          expect(resultObject.data.test).to.be.equal(valueThird)
        })
        .should.be.eventually.fulfilled.and.notify(done)
    })

    it('when does conditional update and object id do not exists, the object has not been created',
      function (done) {
        var resourceId = Date.now()
        var TEST_OBJECT = {
          test: valueFirst
        }
        var params = {
          condition: [{
            '$eq': {
              test: valueSecond
            }
          }]
        }

        corbelDriver.resources.resource(COLLECTION, resourceId)
          .update(TEST_OBJECT, params)
          .should.be.eventually.rejected
          .then(function (e) {
            expect(e).to.have.property('status', 412)
            expect(e.data).to.have.property('error', 'precondition_failed')

            return corbelDriver.resources.resource(COLLECTION, resourceId)
              .get()
              .should.be.eventually.rejected
          })
          .then(function (e) {
            expect(e).to.have.property('status', 404)
            expect(e.data).to.have.property('error', 'not_found')
          }).should.be.eventually.fulfilled.and.notify(done)
      })
  })
})
