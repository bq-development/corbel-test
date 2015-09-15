var unsetDates = function(object) {
    delete object._createdAt;
    delete object._updatedAt;
    return object;
};

describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing CRUD operations ', function() {
        var corbelDriver;
        var COLLECTION_NAME_CRUD = 'test:corbelCrudCollectionTest' + Date.now();
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

        before(function() {
          corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        it('collection has CRUD operations and you can follow complete life flow', function(done) {
            var resourceId;

            corbelDriver.resources.collection(COLLECTION_NAME_CRUD)
                .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                  resourceId = id;

                  return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                  .get()
                  .should.be.eventually.fulfilled;
                })
                .then(function(resultObject){
                  var testObject = _.cloneDeep(resultObject.data);
                  delete testObject.links;
                  testObject.newField = 'newField';
                  testObject.test2 = null;

                  return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                  .update(testObject)
                  .should.be.eventually.fulfilled;
                })
                .then(function() {
                  return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                  .get()
                  .should.be.eventually.fulfilled;
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
                 .should.be.eventually.fulfilled; 
                })
                .then(function(){
                  return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                  .delete()
                  .should.be.eventually.fulfilled;
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
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('ID never changes in an update request', function(done) {
          var idRandom = 'id' + Date.now();
          var TEST_OBJECT = {
              test: 'test',
              test2: 'test2' 
          };  
              
          corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
              .update(TEST_OBJECT)
              .should.be.eventually.fulfilled
              .then(function() {
                  return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                  .get()
                  .should.be.eventually.fulfilled; 
              })
              .then(function(response) {
                  expect(response.data.test).to.be.equal('test');
                  expect(response.data.test2).to.be.equal('test2');
              })
              .should.be.eventually.fulfilled.and.notify(done);
        });

        it('it is possible to create an empty object with put method', function(done) {
            var idRandom = 'id' + Date.now();
            var TEST_OBJECT = {};
            
            corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .update(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(data) {
                    return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response.data.id).to.be.equal(idRandom);
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('it is possible to update an existing resource', function(done) {
            var idRandom = 'id' + Date.now();
            var TEST_OBJECT = {
                test: 'test',
                test2: 'test2'
            };
            var TEST_OBJECT_UPDATED = {
                test: 'testUpdated'
            };

            corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
            .update(TEST_OBJECT)
            .should.be.eventually.fulfilled
            .then(function() {

              return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
              .get()
              .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data.test).to.be.equal('test');
                expect(response.data.test2).to.be.equal('test2');

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .update(TEST_OBJECT_UPDATED)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data.test).to.be.equal('testUpdated');
                expect(response.data.test2).to.be.equal('test2');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('if you update an existing resource but do not update the id field,' +
               ' all fields are update less id', function(done) {
            var idRandom = 'id' + Date.now();
            var TEST_OBJECT = {
                test: 'test',
                test2: 'test2'
            };
            var TEST_OBJECT_UPDATED = {
                id: 'new id',
                test: 'testUpdated'
            };

            corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
            .update(TEST_OBJECT)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data.test).to.be.equal('test');
                expect(response.data.test2).to.be.equal('test2');

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .update(TEST_OBJECT_UPDATED)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data.test).to.be.equal('testUpdated');
                expect(response.data.test2).to.be.equal('test2'); 
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when a whole collection is updated through collection.update', function() {
            var amount = 10;
            var collectionName;

            beforeEach(function(done) {
                collectionName = 'test:CorbelJSObjectCrudUpdate' + Date.now();

                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, collectionName, amount)
                .should.be.eventually.fulfilled.and.notify(done);
            });

            afterEach(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled.and.notify(done);
            });
        
            it('all alements are updated while using the method without params', function(done){
                var updateObject = {
                    globalUpdate: 'OK'
                };

                corbelDriver.resources.collection(collectionName)
                .get()
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                })
                .then(function(){
                    return corbelDriver.resources.collection(collectionName)
                    .update(updateObject)
                    .should.be.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.collection(collectionName)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                    response.data.forEach(function(element){
                        expect(element).to.have.property('globalUpdate', 'OK');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('only matching elements are updated while using the method with correct params', function(done){
                var updateObject = {
                    globalUpdate: 'OK'
                };

                var condition = {
                    condition: [{
                        '$eq': {
                            intField: 700
                        }
                    }]
                };

                var query = {
                    query: [{
                        '$eq': {
                            intField: 700
                        }
                    }]
                };

                corbelDriver.resources.collection(collectionName)
                .get()
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                })
                .then(function(){
                    return corbelDriver.resources.collection(collectionName)
                    .update(updateObject, condition)
                    .should.be.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.collection(collectionName)
                    .get(query)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data.globalUpdate', 'OK');
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('all elements are updated while using the method with malformed condition params', function(done){
                var updateObject = {
                    globalUpdate: 'OK'
                };

                var condition = {
                    query: [{
                        '$eq': {
                            intField: 700
                        }
                    }]
                };

                corbelDriver.resources.collection(collectionName)
                .get()
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                })
                .then(function(){
                    return corbelDriver.resources.collection(collectionName)
                    .update(updateObject, condition)
                    .should.be.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.collection(collectionName)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                    response.data.forEach(function(element){
                        expect(element).to.have.property('globalUpdate', 'OK');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('no element is updated while using the method with a non-existent field condition', function(done){
                var updateObject = {
                    globalUpdate: 'OK'
                };

                var condition = {
                    condition: [{
                        '$eq': {
                            unexistent: 'asdf'
                        }
                    }]
                };

                corbelDriver.resources.collection(collectionName)
                .get()
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                })
                .then(function(){
                    return corbelDriver.resources.collection(collectionName)
                    .update(updateObject, condition)
                    .should.be.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.collection(collectionName)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                    response.data.forEach(function(element){
                        expect(element).to.not.have.property('globalUpdate');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('no element is updated while using the method trying to update _field', function(done){
                var updateObject = {
                    _createdAt: 1000000
                };

                corbelDriver.resources.collection(collectionName)
                .get()
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                })
                .then(function(){
                    return corbelDriver.resources.collection(collectionName)
                    .update(updateObject)
                    .should.be.eventually.be.rejected;
                })
                .then(function() {
                    return corbelDriver.resources.collection(collectionName)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    response.forEach(function(element){
                        expect(element.data._createdAt).to.not.be.equal('1000000');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        it('if you create an object with skip not allowed attributes which starts with an underscore' +
               ' fails returning INVALID ENTITY (422)', function(done) {
            var resourceId;
            var underscoreObject = {
                '_field1': 'asdf'
            };

            corbelDriver.resources.collection(COLLECTION_NAME_CRUD)
            .add(underscoreObject)
            .should.eventually.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');

                return corbelDriver.resources.collection(COLLECTION_NAME_CRUD)
                .add(TEST_OBJECT)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                resourceId = id;

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .update(underscoreObject)
                .should.eventually.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('if you create a bad object', function() {
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
                        corbelDriver.resources.collection(COLLECTION_NAME_CRUD)
                        .add(malformedObject)
                        .should.eventually.be.rejected
                        .then(function(e) {
                            expect(e).to.have.property('status', 422);
                            expect(e).to.have.deep.property('data.error', 'invalid_entity');
                            
                            return corbelDriver.resources.collection(COLLECTION_NAME_CRUD)
                            .add(TEST_OBJECT)
                            .should.be.eventually.fulfilled;
                        })
                        .then(function(id) {
                            resourceId = id;
                            return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                            .update(malformedObject)
                            .should.eventually.be.rejected;
                        })
                        .then(function(e) {
                            expect(e).to.have.property('status', 422);
                            expect(e).to.have.deep.property('data.error', 'invalid_entity');

                            return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                            .delete()
                            .should.be.eventually.fulfilled;
                        })
                        .should.be.eventually.fulfilled.and.notify(done);
                    });
                }
            }
        });
    });
});
