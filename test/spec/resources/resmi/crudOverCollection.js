describe('In RESOURCES module', function() {
  var corbelDriver;
  before(function() {
    corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
  });
    var COLLECTION_NAME_CRUD = 'test:corbelTest' + Date.now();
    console.log('collection', COLLECTION_NAME_CRUD);

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

        it.only('and successes', function(done) {
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
                resultObject = corbelTest.utils.unsetDates(resultObject);
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
                expect(e).to.have.property('status', 404);
                var error = JSON.parse(e.data.responseText);
                expect(error).to.have.property('error', 'not_found');
              })
              .should.eventually.be.fulfilled.notify(done);
        });

      });

      describe('you create object wit.skiph put method', function() {

        it.skip('succesfully', function() {});
      });

      describe('you create empty object wit.skiph put method', function() {
        it.skip('succesfully', function() {});
      });
      describe('you update existing resource', function() {
        it.skip('succesfully', function() {});
      });
      describe('you update existing resource wit.skiph id field in resource to update then', function() {
        it.skip('all fields are update less id', function() {});
      });
      describe('you create bad object', function() {
        //for (var malformedObjectType in badObjects) {
        //var malformedObject = badObjects[malformedObjectType];
        //it.skip('with ' + malformedObjectType + ' fails returning INVALID ENTITY (422)', function() {
        //});
      });
      describe('you create an object wit.skiph not allowed attributes starting with an underscore', function() {

        it.skip('fails returning INVALID ENTITY (422)', function() {});
      });
    });
  });
});
