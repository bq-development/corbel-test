describe('In RESOURCES module', function () {
  describe('In RESMI module, testing relation search, ', function () {
    describe('while testing whether a field is indexed or not', function () {
      var corbelDriver
      var COLLECTION_A = 'test:searchableCollectionA'
      var COLLECTION_B = 'test:searchableCollectionB'
      var random = Date.now()
      var idResource = random + '1'
      var MAX_RETRY = 30
      var RETRY_PERIOD = 1

      var object1 = {
        notIndexedInteger: 12344321,
        indexedInteger: 43211234
      }

      var object2 = {
        notIndexedInteger: 56788765,
        indexedInteger: 87655678
      }

      var object3 = {
        notIndexedInteger: 90122109,
        indexedInteger: 21099012
      }

      before(function (done) {
        var dataArray = [object1, object2, object3]
        var ids = [random + '1', random + '2', random + '3']

        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()

        corbelDriver.resources.resource(COLLECTION_A, idResource)
          .update({})
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver,
              COLLECTION_A, idResource, COLLECTION_B, ids, dataArray)
              .should.be.eventually.fulfilled
          })
          .should.notify(done)
      })

      after(function (done) {
        corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
              .delete()
              .should.be.eventually.fulfilled
          })
          .should.notify(done)
      })

      it('no results are retrieved when searching not indexed values', function (done) {
        var params = {
          search: object1.notIndexedInteger
        }

        corbelTest.common.utils.retry(function () {
          return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function (response) {
              expect(response).to.have.deep.property('data.length', 0)
            })
        }, MAX_RETRY, RETRY_PERIOD)
          .should.notify(done)
      })

      it('results are retrieved when searching indexed values', function (done) {
        var params = {
          search: object1.indexedInteger
        }

        corbelTest.common.utils.retry(function () {
          return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function (response) {
              expect(response).to.have.deep.property('data.length', 1)
              expect(response).to.have.deep.property('data[0].indexedInteger', object1.indexedInteger)
            })
        }, MAX_RETRY, RETRY_PERIOD)
          .should.notify(done)
      })
    })
  })
})
