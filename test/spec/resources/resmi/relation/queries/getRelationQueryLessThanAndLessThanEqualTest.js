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

    describe('query language field less than', function () {
      it('int elements less than 200 are returned', function (done) {
        var params = {
          query: [{
            '$lt': {
              intCount: 200
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 2)

            response.data.forEach(function (element) {
              expect(element).to.have.property('intCount').and.to.be.below(200)
            })
          })
          .should.notify(done)
      })

      it('string elements less than stringContent4 are returned', function (done) {
        var params = {
          query: [{
            '$lt': {
              stringField: 'stringContent1'
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 1)
          })
          .should.notify(done)
      })

      it('float elements less than 0.2 are returned', function (done) {
        var params = {
          query: [{
            '$lt': {
              floatCount: 0.2
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 2)

            response.data.forEach(function (element) {
              expect(element).to.have.property('floatCount').and.to.be.below(0.2)
            })
          })
          .should.notify(done)
      })

      it('false elements are returned, querying for elems less than true', function (done) {
        var params = {
          query: [{
            '$lt': {
              booleanCount: true
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

      it('ISODate elements less than 15 July 2010 15:05 UTC are returned', function (done) {
        var isoDateBoundary = 'ISODate(' + new Date('15 July 2010 15:05 UTC').toISOString()
        var isoDate1 = 'ISODate(' + new Date('25 July 2010 15:05 UTC').toISOString()
        var isoDate2 = 'ISODate(' + new Date('10 July 2010 15:05 UTC').toISOString()

        var data1 = {
          isoDate: isoDate1
        }

        var data2 = {
          isoDate: isoDate2
        }

        var params = {
          query: [{
            '$lt': {
              isoDate: isoDateBoundary
            }
          }]
        }

        var dataArray = [data1, data2]

        corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
          COLLECTION_B, idsResourcesInB, dataArray)
          .should.be.eventually.fulfilled
          .then(function (response) {
            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, params)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 1)
            expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[1])
          })
          .should.notify(done)
      })

      it('period elements less than P1Y2D are returned', function (done) {
        var periodBoundary = 'Period (P1Y2D)'
        var period1 = 'Period (P1Y1D)'
        var period2 = 'Period (P1Y2D)'

        var data1 = {
          periodField: period1
        }

        var data2 = {
          periodField: period2
        }

        var params = {
          query: [{
            '$lt': {
              periodField: periodBoundary
            }
          }]
        }

        var dataArray = [data1, data2]

        corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
          COLLECTION_B, idsResourcesInB, dataArray)
          .should.be.eventually.fulfilled
          .then(function (response) {
            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, params)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 1)
            expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[0])
          })
          .should.notify(done)
      })
    })

    describe('query language less than or equal', function () {
      it('int elements less than or equalt to 200 are returned', function (done) {
        var params = {
          query: [{
            '$lte': {
              intCount: 200
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 3)

            response.data.forEach(function (element) {
              expect(element).to.have.property('intCount').and.to.be.below(300)
            })
          })
          .should.notify(done)
      })

      it('string elements less than stringContent4 are returned', function (done) {
        var params = {
          query: [{
            '$lte': {
              stringField: 'stringContent1'
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 2)
          })
          .should.notify(done)
      })

      it('float elements less than or equal to 0.2 are returned', function (done) {
        var params = {
          query: [{
            '$lte': {
              floatCount: 0.2
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 3)

            response.data.forEach(function (element) {
              expect(element).to.have.property('floatCount').and.to.be.below(0.3)
            })
          })
          .should.notify(done)
      })

      it('all elements are returned, querying for elems less than or equal to true', function (done) {
        var params = {
          query: [{
            '$lte': {
              booleanCount: true
            }
          }]
        }

        corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
          idResourceInA, COLLECTION_B, params)
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', amount)
          })
          .should.notify(done)
      })

      it('ISODate elements less than or equal to 15 July 2010 15:05 UTC are returned', function (done) {
        var isoDateBoundary = 'ISODate(' + new Date('15 July 2010 15:05 UTC').toISOString()
        var isoDate1 = 'ISODate(' + new Date('25 July 2010 15:05 UTC').toISOString()
        var isoDate2 = 'ISODate(' + new Date('10 July 2010 15:05 UTC').toISOString()

        var data1 = {
          isoDate: isoDate1
        }

        var data2 = {
          isoDate: isoDate2
        }

        var params = {
          query: [{
            '$lte': {
              isoDate: isoDateBoundary
            }
          }]
        }

        var dataArray = [data1, data2]

        corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
          COLLECTION_B, idsResourcesInB, dataArray)
          .should.be.eventually.fulfilled
          .then(function (response) {
            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, params)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 1)
            expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[1])
          })
          .should.notify(done)
      })

      it('period elements less than or equal to P1Y2D are returned', function (done) {
        var periodBoundary = 'Period (P1Y2D)'
        var period1 = 'Period (P1Y2D)'
        var period2 = 'Period (P1Y1D)'

        var data1 = {
          periodField: period1
        }

        var data2 = {
          periodField: period2
        }

        var params = {
          query: [{
            '$lte': {
              periodField: periodBoundary
            }
          }]
        }

        var dataArray = [data1, data2]

        corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
          COLLECTION_B, idsResourcesInB, dataArray)
          .should.be.eventually.fulfilled
          .then(function (response) {
            return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
              idResourceInA, COLLECTION_B, params)
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 2)
          })
          .should.notify(done)
      })
    })
  })
})
