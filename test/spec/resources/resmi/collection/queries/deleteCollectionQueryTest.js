describe('In RESOURCES module', function () {
  describe('In RESMI module, testing collection queries,', function () {
    var corbelDriver
    var COLLECTION = 'test:CorbelJSObjectDeleteCollectionQuery' + Date.now()
    var amount = 10

    beforeEach(function (done) {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()
      corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount).should.eventually.be.fulfilled.notify(done)
    })

    it('if we use delete collection without query all elements are deleted', function (done) {
      var params = {
        query: [{
          '$eq': {
            stringSortCut: 'Test Short Cut'
          }
        }]
      }

      corbelDriver.resources.collection(COLLECTION)
        .get(params)
        .should.be.eventually.fulfilled
        .then(function (response) {
          response.data.forEach(function (element) {
            expect(element.stringSortCut).to.be.equal('Test Short Cut')
          })

          return corbelDriver.resources.collection(COLLECTION)
            .delete()
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response.data.length).to.be.equal(0)
        })
        .should.be.eventually.fulfilled.and.notify(done)
    })

    it('if we use delete collection with query params all elements corresponding to query params are deleted', function (done) {
      var paramsToDelete = {
        query: [{
          '$gt': {
            intField: 500
          }
        }]
      }

      var paramsToCheck = {
        query: [{
          '$lt': {
            intField: 600
          }
        }]
      }

      corbelDriver.resources.collection(COLLECTION)
        .get(paramsToDelete)
        .should.be.eventually.fulfilled
        .then(function (response) {
          response.data.forEach(function (element) {
            expect(element.intField).to.be.above(500)
          })

          return corbelDriver.resources.collection(COLLECTION)
            .delete(paramsToDelete)
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return corbelDriver.resources.collection(COLLECTION)
            .get(paramsToDelete)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response.data.length).to.be.equal(0)

          return corbelDriver.resources.collection(COLLECTION)
            .get(paramsToCheck)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response.data.length).to.be.equal(5)
          response.data.forEach(function (element) {
            expect(element.intField).to.be.below(600)
          })
        })
        .should.be.eventually.fulfilled.and.notify(done)
    })
  })
})
