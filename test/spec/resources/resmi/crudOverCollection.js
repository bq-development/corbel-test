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

  describe('In RESMI module', function() {

    describe('Collection has CRUD operations and when', function() {

      describe('you can follow complete life flow', function() {

        it('and successes', function(done) {
          var resourceId;
          corbelDriver.resources.collection(COLLECTION_NAME_CRUD)
              .add(TEST_OBJECT)
              .should.eventually.be.fulfilled
              .then(function(id) {
                resourceId = id;
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).get()
                .should.eventually.be.fulfilled;
              })
              .then(function(resultObject){
                var testObject = _.clone(resultObject.data);
                delete testObject.links;
                testObject.newField = 'newField';
                testObject.test2 = null;
                //Test Update
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).update(testObject)
                .should.eventually.be.fulfilled;
              })
              .then(function() {
                // Test Get
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).get()
                .should.eventually.be.fulfilled;
              })
              .then(function(response){
                //// @todo: fix this in PhantomJS
                //if (response.data.length) {
                  //response.data = response.data[0];
                //}
                var resultObject = response.data;
                delete resultObject.links;
                //delete resultObject.id;
                var testObject = _.clone(TEST_OBJECT);
                delete testObject.test2;
                testObject.newField = 'newField';
                testObject.id = resourceId;
                resultObject = corbelTest.resources.unsetDates(resultObject);
                expect(resultObject).to.be.deep.equal(testObject);
                //Delete
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).delete()
               .should.eventually.be.fulfilled; 
              })
              .then(function(){
                //Delete is idempotent
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).delete()
                .should.eventually.be.fulfilled;
              })
              .then(function() {
                // Get after delete
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).get()
                .should.eventually.be.rejected;
              })
              .then(function(e) {
                var error = JSON.parse(e.data.responseText);

                expect(e).to.have.property('status', 404);
                expect(error).to.have.property('error', 'not_found');
              })
              .should.eventually.be.fulfilled.notify(done);
        });

        // @todo There is another it for backbone. Maybe it's necessary another
        // implementation

      });

      describe('you create object skipping put method', function() {
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
                      return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom).get()
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
              return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom).get()
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
                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, idRandom).get()
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
                        var error = JSON.parse(e.data.responseText);

                        expect(e).to.have.property('status', 422);
                        expect(error).to.have.property('error', 'invalid_entity');
                        
                        return corbelDriver.resources.collection(COLLECTION_NAME_CRUD).add(TEST_OBJECT)
                        .should.eventually.be.fulfilled;
                    })
                    .then(function(id) {
                        resourceId = id;
                        return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).update(malformedObject)
                        .should.eventually.be.rejected;
                    })
                    .then(function(e) {
                        var error = JSON.parse(e.data.responseText);

                        expect(e).to.have.property('status', 422);
                        expect(error).to.have.property('error', 'invalid_entity');
                        return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).delete()
                        .should.eventually.be.fulfilled;
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            }
        }
      });
      describe('you create an object wit.skiph not allowed attributes starting with an underscore', function() {

        it('fails returning INVALID ENTITY (422)', function(done) {
            var resourceId;

            var underscoreObject = {
                '_field1': 'asdf'
            };

            corbelDriver.resources.collection(COLLECTION_NAME_CRUD).add(underscoreObject)
            .should.eventually.be.rejected
            .then(function(e) {
                var error = JSON.parse(e.data.responseText);

                expect(e).to.have.property('status', 422);
                expect(error).to.have.property('error', 'invalid_entity');

                return corbelDriver.resources.collection(COLLECTION_NAME_CRUD).add(TEST_OBJECT)
                .should.eventually.be.fulfilled;
            })
            .then(function(id) {
                resourceId = id;

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .update(underscoreObject)
                .should.eventually.be.rejected;
            })
            .then(function(e) {
                var error = JSON.parse(e.data.responseText);

                expect(e).to.have.property('status', 422);
                expect(error).to.have.property('error', 'invalid_entity');

                return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).delete()
                .should.eventually.be.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });
      });
    });
  });
});
