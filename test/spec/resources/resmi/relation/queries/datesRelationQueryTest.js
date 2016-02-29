describe('In RESOURCES module', function () {
  describe('In RESMI module, testing relation queries, ', function () {
    var corbelDriver
    var COLLECTION_A = 'test:CorbelJSObjectQueryA' + Date.now()
    var COLLECTION_B = 'test:CorbelJSObjectQueryB' + Date.now()
    var amount = 10
    var idResourceInA
    var idsResourecesInB

    beforeEach(function (done) {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()

      corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
        .should.be.eventually.fulfilled
        .then(function (id) {
          idResourceInA = id[0]

          return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
            .should.be.eventually.fulfilled
        })
        .then(function (ids) {
          idsResourecesInB = ids

          return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject(corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB)
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    afterEach(function (done) {
      corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .delete()
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    describe('when timestamp is used', function () {
      it('should be able to use timestamp parameter in queries with $gt creationTime + 10000', function (done) {
        var date
        var queryParams

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B)
          .then(function (response) {
            date = response.data[0]._updatedAt
            queryParams = {
              query: [{
                '$gt': {
                  _updatedAt: date + 10000
                }
              }]
            }

            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, queryParams)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 0)
          })
          .should.notify(done)
      })

      it('should be able to use timestamp parameter in queries with $gt creationTime - 10000', function (done) {
        var date
        var queryParams

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B)
          .then(function (response) {
            date = response.data[0]._updatedAt
            queryParams = {
              query: [{
                '$gt': {
                  _updatedAt: date - 10000
                }
              }]
            }

            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, queryParams)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', amount)
          })
          .should.notify(done)
      })

      it('should be able to use timestamp parameter in queries with $lt creationTime + 10000', function (done) {
        var date
        var queryParams

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B)
          .then(function (response) {
            date = response.data[0]._updatedAt
            queryParams = {
              query: [{
                '$lt': {
                  _updatedAt: date + 10000
                }
              }]
            }

            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, queryParams)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', amount)
          })
          .should.notify(done)
      })

      it('should be able to use timestamp parameter in queries with $lt creationTime - 10000', function (done) {
        var date
        var queryParams

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B)
          .then(function (response) {
            date = response.data[0]._updatedAt
            queryParams = {
              query: [{
                '$lt': {
                  _updatedAt: date - 10000
                }
              }]
            }

            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, queryParams)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 0)
          })
          .should.notify(done)
      })
    })

    describe('when ISODate is used', function () {
      it('should be able to use ISODate parameter in queries with $gt creationTime + 10000', function (done) {
        var date
        var datemillis
        var queryParams = {
          query: [{
            '$gt': {
              _updatedAt: 1
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B)
          .then(function (response) {
            datemillis = response.data[0]._updatedAt
            date = 'ISODate(' + new Date(datemillis + 10000).toISOString() + ')'
            queryParams = {
              query: [{
                '$gt': {
                  _updatedAt: date
                }
              }]
            }

            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, queryParams)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 0)
          })
          .should.notify(done)
      })

      it('should be able to use ISODate parameter in queries with $gt creationTime - 10000', function (done) {
        var date
        var datemillis
        var queryParams = {
          query: [{
            '$gt': {
              _updatedAt: 1
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B)
          .then(function (response) {
            datemillis = response.data[0]._updatedAt
            date = 'ISODate(' + new Date(datemillis - 10000).toISOString() + ')'
            queryParams = {
              query: [{
                '$gt': {
                  _updatedAt: date
                }
              }]
            }

            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, queryParams)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', amount)
          })
          .should.notify(done)
      })

      it('should be able to use ISODate parameter in queries with $lt creationTime + 10000', function (done) {
        var date
        var datemillis
        var queryParams = {
          query: [{
            '$lt': {
              _updatedAt: 1
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B)
          .then(function (response) {
            datemillis = response.data[0]._updatedAt
            date = 'ISODate(' + new Date(datemillis + 10000).toISOString() + ')'
            queryParams = {
              query: [{
                '$gt': {
                  _updatedAt: date
                }
              }]
            }

            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, queryParams)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 0)
          })
          .should.notify(done)
      })

      it('should be able to use ISODate parameter in queries with $lt creationTime - 10000', function (done) {
        var date
        var datemillis
        var queryParams = {
          query: [{
            '$lt': {
              _updatedAt: 1
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B)
          .then(function (response) {
            datemillis = response.data[0]._updatedAt
            date = 'ISODate(' + new Date(datemillis - 10000).toISOString() + ')'
            queryParams = {
              query: [{
                '$gt': {
                  _updatedAt: date
                }
              }]
            }

            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, queryParams)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', amount)
          })
          .should.notify(done)
      })
    })
  })
})
