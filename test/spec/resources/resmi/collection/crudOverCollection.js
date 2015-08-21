var unsetDates = function(object) {
    delete object._createdAt;
    delete object._updatedAt;
    return object;
};

describe('In RESOURCES module', function() {
  var corbelDriver;

  before(function() {
    corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
  });

  var COLLECTION_NAME_CRUD = 'test:corbelTest' + Date.now();

  var TEST_OBJECT = {
        test: 'test',
        test2: 'test2',
        test3: 1,
        test4: 1.3,
        test5: {
            t1: 1.3,
            t2: [1, 2, 3.3]
        }
  };

  describe('In RESMI module, testing Crud ', function() {

    describe('collection has CRUD operations and when', function() {

      describe('you can follow complete life flow', function() {

        it('and successes', function(done) {
          var resourceId;

          corbelDriver.resources.collection(COLLECTION_NAME_CRUD)
              .add(TEST_OBJECT)
              .should.eventually.be.fulfilled
              .then(function(id) {
                resourceId = id;

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .get()
                .should.eventually.be.fulfilled;
              })
              .then(function(resultObject){
                var testObject = _.cloneDeep(resultObject.data);
                delete testObject.links;
                testObject.newField = 'newField';
                testObject.test2 = null;

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .update(testObject)
                .should.eventually.be.fulfilled;
              })
              .then(function() {
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .get()
                .should.eventually.be.fulfilled;
              })
              .then(function(response){
                var resultObject = response.data;
                delete resultObject.links;
                var testObject = _.cloneDeep(TEST_OBJECT);
                delete testObject.test2;
                testObject.newField = 'newField';
                testObject.id = resourceId;
                resultObject = unsetDates(resultObject);
                expect(resultObject).to.be.deep.equal(testObject);

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .delete()
               .should.eventually.be.fulfilled; 
              })
              .then(function(){
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .delete()
                .should.eventually.be.fulfilled;
              })
              .then(function() {
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .get()
                .should.eventually.be.rejected;
              })
              .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e.data).to.have.property('error', 'not_found');
              })
              .should.eventually.be.fulfilled.notify(done);
        });
      });

      describe('ID is never changed in an update request', function() {
        var idRandom = 'id' + Date.now();

        var TEST_OBJECT = {
            test: 'test',
            test2: 'test2' 
        };  

        it('succesfully', function(done) {
            
            corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .update(TEST_OBJECT)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom).get()
                    .should.eventually.be.fulfilled; 
                })
                .then(function(response) {
                    expect(response.data.test).to.be.equal('test');
                    expect(response.data.test2).to.be.equal('test2');
                })
                .should.eventually.be.fulfilled.notify(done);
        });
      });

      describe('you create empty object with put method', function() {
          var idRandom = 'id' + Date.now();

          var TEST_OBJECT = {};
          
          it('succesfully', function(done) {
          
              corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                  .update(TEST_OBJECT)
                  .should.eventually.be.fulfilled
                  .then(function(data) {
                      return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                      .get()
                      .should.eventually.be.fulfilled;
                  })
                  .then(function(response) {
                      expect(response.data.id).to.be.equal(idRandom);
                  })
                  .should.eventually.be.fulfilled.notify(done);
          });
      });

      describe('you update existing resource', function() {
          var idRandom = 'id' + Date.now();

          var TEST_OBJECT = {
              test: 'test',
              test2: 'test2'
          };

          var TEST_OBJECT_UPDATED = {
              test: 'testUpdated'
          };

        it('succesfully', function(done) {
        
            corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
            .update(TEST_OBJECT)
            .should.eventually.be.fulfilled
            .then(function() {

              return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
              .get()
              .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response.data.test).to.be.equal('test');
                expect(response.data.test2).to.be.equal('test2');

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .update(TEST_OBJECT_UPDATED)
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom).get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response.data.test).to.be.equal('testUpdated');
                expect(response.data.test2).to.be.equal('test2');
            })
            .should.eventually.be.fulfilled.notify(done);
        });
      });

      describe('you update existing resource but not updating id field then', function() {
        var idRandom = 'id' + Date.now();

        var TEST_OBJECT = {
            test: 'test',
            test2: 'test2'
        };

        var TEST_OBJECT_UPDATED = {
            id: 'new id',
            test: 'testUpdated'
        };

        it('all fields are update less id', function(done) {
        
            corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
            .update(TEST_OBJECT)
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response.data.test).to.be.equal('test');
                expect(response.data.test2).to.be.equal('test2');

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .update(TEST_OBJECT_UPDATED)
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response.data.test).to.be.equal('testUpdated');
                expect(response.data.test2).to.be.equal('test2'); 
            })
            .should.eventually.be.fulfilled.notify(done);
        });
      });

      describe('you create bad object', function() {
        var badObjects = {
            MALFORMED: ['{"test": "test"}', '{"field1": "asdf"},'],
            MALFORMED_SCHEMA: ['{"id": "testId"}', '{ "field1"="asdf"}', '{"field2": "qwer"}'],
            MALFORMED_PARAM: ['{"id": "testId"}', '{ field1":"asdf"}', '{"field2": "qwer"}'],
            MALFORMED_FIELD: ['{"id": "testId"}', '{ "field1":"asdf"}', '{"field2"}'],
        };

        for (var malformedObjectType in badObjects) {
            if (badObjects.hasOwnProperty(malformedObjectType)) {
                var malformedObject = badObjects[malformedObjectType];

                it('with ' + malformedObjectType + ' fails returning INVALID ENTITY (422)', function(done) {
                    var resourceId;
                    corbelDriver.resources.collection(COLLECTION_NAME_CRUD).add(malformedObject)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 422);
                        expect(e.data).to.have.property('error', 'invalid_entity');
                        
                        return corbelDriver.resources.collection(COLLECTION_NAME_CRUD)
                        .add(TEST_OBJECT)
                        .should.eventually.be.fulfilled;
                    })
                    .then(function(id) {
                        resourceId = id;
                        return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                        .update(malformedObject)
                        .should.eventually.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 422);
                        expect(e.data).to.have.property('error', 'invalid_entity');

                        return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                        .delete()
                        .should.eventually.be.fulfilled;
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            }
        }
      });
      describe('you create an object with skip not allowed attributes starting with an underscore', function() {

        it('fails returning INVALID ENTITY (422)', function(done) {
            var resourceId;

            var underscoreObject = {
                '_field1': 'asdf'
            };

            corbelDriver.resources.collection(COLLECTION_NAME_CRUD).add(underscoreObject)
            .should.eventually.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e.data).to.have.property('error', 'invalid_entity');

                return corbelDriver.resources.collection(COLLECTION_NAME_CRUD)
                .add(TEST_OBJECT)
                .should.eventually.be.fulfilled;
            })
            .then(function(id) {
                resourceId = id;

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .update(underscoreObject)
                .should.eventually.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e.data).to.have.property('error', 'invalid_entity');

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .delete()
                .should.eventually.be.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });
      });
    });
  });
});
