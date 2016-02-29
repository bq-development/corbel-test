describe('In RESOURCES module', function () {
  describe('In RESMI module, testing relation search, ', function () {
    describe('when conditions are applied to object type fields', function () {
      var corbelDriver
      var COLLECTION_A = 'test:searchableCollectionA'
      var COLLECTION_B = 'test:searchableCollectionB'
      var random = Date.now()
      var idResource = random + '1'
      var MAX_RETRY = 30
      var RETRY_PERIOD = 1
      var punctText = 'La sombra. Celín. Tropiquillos. Theros.'
      var specialCharacters = 'äâêíìéè'

      var object1 = {
        field1: 'Test' + random,
        object: {
          objectInt: 1,
          objectString: 'first object string',
          objectBoolean: true
        },
        description: 'And this is the first resource',
        sortIntegerField: 10
      }

      var object2 = {
        field2: 'tEst' + random,
        object: {
          objectInt: 2,
          objectString: 'second object string',
          objectBoolean: false
        },
        description: 'And this is the second resource',
        punctuationTest: specialCharacters + random,
        sortIntegerField: 9
      }

      var object3 = {
        field3: 'teSt' + random,
        object: {
          objectInt: 3,
          objectString: 'third object string',
          objectBoolean: true
        },
        description: 'And this is the third resource',
        punctuationTest: punctText + random,
        sortIntegerField: 6
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

      it('when the condition is set to a numeric field', function (done) {
        var params = {
          search: 'test' + random,
          query: [{
            '$gt': {
              'object.objectInt': 1
            }
          }],
          indexFieldsOnly: false
        }

        corbelTest.common.utils.retry(function () {
          return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function (response) {
              expect(response).to.have.deep.property('data.length', 2)
            })
        }, MAX_RETRY, RETRY_PERIOD)
          .should.notify(done)
      })

      it('when the condition is set to a boolean field', function (done) {
        var params = {
          search: 'test' + random,
          query: [{
            '$eq': {
              'object.objectBoolean': false
            }
          }],
          indexFieldsOnly: false
        }

        corbelTest.common.utils.retry(function () {
          return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function (response) {
              expect(response).to.have.deep.property('data.length', 1)
              expect(response).to.have.deep.property('data[0].description', object2.description)
            })
        }, MAX_RETRY, RETRY_PERIOD)
          .should.notify(done)
      })

      it('when the condition is set to a string type field', function (done) {
        var params = {
          search: 'test' + random,
          query: [{
            '$eq': {
              'object.objectString': 'first object string'
            }
          }],
          indexFieldsOnly: false
        }

        corbelTest.common.utils.retry(function () {
          return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function (response) {
              expect(response).to.have.deep.property('data.length', 1)
            })
        }, MAX_RETRY, RETRY_PERIOD)
          .should.notify(done)
      })

      it('when the condition is set over an array of string', function (done) {
        var params = {
          search: 'test' + random,
          query: [{
            '$in': {
              'object.objectString': ['first object string']
            }
          }],
          indexFieldsOnly: false
        }

        corbelTest.common.utils.retry(function () {
          return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function (response) {
              expect(response).to.have.deep.property('data.length', 1)
            })
        }, MAX_RETRY, RETRY_PERIOD)
          .should.notify(done)
      })
    })
  })
})
