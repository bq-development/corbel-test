describe('In RESOURCES module', function () {
  describe('In RESMI module, while testing distinct in relation', function () {
    var corbelDriver
    var TIMESTAMP = Date.now()
    var COLLECTION_A = 'test:distinctRelationA' + TIMESTAMP
    var COLLECTION_B = 'test:distinctRelationB' + TIMESTAMP
    var amount = 50

    var idResourceInA
    var idsResourecesInB

    before(function (done) {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()

      corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
        .should.be.eventually.fulfilled
        .then(function (id) {
          idResourceInA = id[0]
          return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
            .should.eventually.be.fulfilled
        })
        .then(function (ids) {
          idsResourecesInB = ids
          return corbelTest.common.resources
            .createRelationFromSingleObjetToMultipleObject(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, idsResourecesInB)
            .should.be.eventually.fulfilled
        })
        .should.be.eventually.fulfilled.and.notify(done)
    })

    after(function (done) {
      corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B).delete()
            .should.eventually.be.fulfilled
        })
        .should.be.eventually.fulfilled.and.notify(done)
    })

    it('distinct elements in a relation are gotten', function (done) {
      var params = {
        distinct: 'distinctField'
      }
      corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
        .get(null, params)
        .should.be.eventually.fulfilled
        .then(function (response) {
          expect(response).to.have.deep.property('data.length', 2)
          response.data.forEach(function (element) {
            expect([0, 1]).to.include(element.distinctField)
          })
        })
        .should.notify(done)
    })

    it('distinct values of a field in a relation are gotten', function (done) {
      var params = {
        distinct: 'distinctField2'
      }
      corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
        .get(null, params)
        .should.be.eventually.fulfilled
        .then(function (response) {
          expect(response).to.have.deep.property('data.length', 4)
          response.data.forEach(function (element) {
            expect([0, 1, 2, 3]).to.include(element.distinctField2)
          })
        })
        .should.notify(done)
    })

    it('distinct elements of a relation are gotten sorted asc by other field', function (done) {
      var params = {
        sort: {
          stringField: 'asc'
        },
        distinct: 'distinctField2'
      }
      corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
        .get(null, params)
        .should.be.eventually.fulfilled
        .then(function (response) {
          expect(response).to.have.deep.property('data.length', 4)
          expect(corbelTest.common
            .resources
            .checkSortingAsc(response.data, 'stringField')).to.be.equal(true)
        })
        .should.notify(done)
    })

    it('retrieve elements filtering a field using distinct with sort asc', function (done) {
      var params = {
        distinct: 'distinctField2',
        sort: {
          distinctField2: 'asc'
        }
      }
      corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
        .get(null, params)
        .should.be.eventually.fulfilled
        .then(function (response) {
          expect(response).to.have.deep.property('data.length', 4)
          expect(corbelTest.common
            .resources
            .checkSortingAsc(response.data, 'distinctField2')).to.be.equal(true)
        })
        .should.notify(done)
    })

    it('retrieve elements filtering a field using distinct sorting desc by another field', function (done) {
      var params = {
        sort: {
          distinctField2: 'desc'
        },
        distinct: 'distinctField2'
      }
      corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
        .get(null, params)
        .should.be.eventually.fulfilled
        .then(function (response) {
          expect(response).to.have.deep.property('data.length', 4)
          expect(corbelTest.common
            .resources
            .checkSortingDesc(response.data, 'distinctField2')).to.be.equal(true)
        })
        .should.notify(done)
    })

    it('elements of a relation are gotten using distinc and a query',
      function (done) {
        var params = {
          distinct: 'distinctField2',
          query: [{
            '$gt': {
              intCount: 700
            }
          }]
        }

        var posiblesValues = [0, 1, 2, 3]

        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
          .get(null, params)
          .should.be.eventually.fulfilled
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 4)
            response.data.forEach(function (element) {
              expect(element.intCount).to.be.above(700)
              expect(posiblesValues).to.include(element.distinctField2)
            })
          })
          .should.notify(done)
      })

    it('elements of a relation are gotten using distinct filter in more than one field', function (done) {
      var params = {
        distinct: ['distinctField', 'distinctField2']
      }

      var posiblesValues = [0, 1, 2, 3]
      var posiblesFieldValues = [0, 1]

      corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
        .get(null, params)
        .should.be.eventually.fulfilled
        .then(function (response) {
          expect(response).to.have.deep.property('data.length', 4)
          response.data.forEach(function (element) {
            expect(posiblesFieldValues).to.include(element.distinctField)
            expect(posiblesValues).to.include(element.distinctField2)
          })
        })
        .should.notify(done)
    })

    it('elements of a relation are gotten using distinct filter ' +
    'in more than one field and pagination query',
      function (done) {
        var params = {
          distinct: ['distinctField2', 'distinctField3'],
          pagination: {
            page: 0,
            pageSize: 25
          }
        }

        var posiblesValues = [0, 1, 2, 3]
        var posiblesFieldValues = [0, 1, 2, 3, 4]

        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
          .get(null, params)
          .should.be.eventually.fulfilled
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 20)
            response.data.forEach(function (element) {
              expect(posiblesFieldValues).to.include(element.distinctField3)
              expect(posiblesValues).to.include(element.distinctField2)
            })
          })
          .should.notify(done)
      })
  })
})
