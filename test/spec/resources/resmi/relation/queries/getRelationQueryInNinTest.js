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

    describe('query language in', function () {
      it('returns elements where ObjectNumber elements are in [3,4] array', function (done) {
        var params = {
          query: [{
            '$in': {
              ObjectNumber: [3, 4]
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 2)
            response.data.forEach(function (element) {
              expect(element.ObjectNumber).to.contain(3, 4)
            })
          })
          .should.notify(done)
      })

      it('does not return elements when querying for elems that are not present in the relation', function (done) {
        var params = {
          query: [{
            '$in': {
              ObjectNumber: [8]
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 0)
          })
          .should.notify(done)
      })

      it('using pagination parameters, elements that satisfy the in query are returned', function (done) {
        var params = {
          query: [{
            '$in': {
              ObjectNumber: [3, 4]
            }
          }],
          pagination: {
            page: 0,
            pageSize: 20
          }
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 2)
            response.data.forEach(function (element) {
              expect(element.ObjectNumber).to.contain(3, 4)
            })
          })
          .should.notify(done)
      })
    })

    describe('query language nin', function () {
      it('returns elements where ObjectNumber elements are not in [3] array', function (done) {
        var params = {
          query: [{
            '$nin': {
              ObjectNumber: [3]
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 3)
            response.data.forEach(function (element) {
              expect(element.ObjectNumber).not.to.contain(3)
            })
          })
          .should.notify(done)
      })

      it('no elements are returned using nin, if all ObjectNumber values are in the array', function (done) {
        var params = {
          query: [{
            '$nin': {
              ObjectNumber: [0, 1, 2, 3, 4]
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 0)
          })
          .should.notify(done)
      })
    })
  })
})
