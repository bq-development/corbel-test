describe('In RESOURCES module', function () {
  describe('In RESMI module, testing relation queries, ', function () {
    var corbelDriver
    var TIMESTAMP = Date.now()
    var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP
    var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP

    var amount = 5
    var idResourceInA
    var idsResourcesInB

    before(function (done) {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()

      corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
        .should.be.eventually.fulfilled
        .then(function (id) {
          idResourceInA = id[0]

          return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
            .should.be.eventually.fulfilled
        })
        .then(function (ids) {
          idsResourcesInB = ids

          return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject(corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourcesInB)
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    after(function (done) {
      corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .delete()
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    describe('query language all', function () {
      it('elements where ObjectNumber contains the array [0,1,2,3,4] are returned', function (done) {
        var params = {
          query: [{
            '$all': {
              ObjectNumber: [0, 1, 2, 3, 4]
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            return response.data.forEach(function (element) {
              element.ObjectNumber.forEach(function (dataElement, i) {
                expect(dataElement).to.be.equals(i)
              })
            })
          })
          .should.notify(done)
      })
    })
  })
})
