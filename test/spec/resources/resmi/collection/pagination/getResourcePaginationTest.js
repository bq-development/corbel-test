describe('In RESOURCES module', function() {
    var corbelDriver;
    var RESOURCES_DEFAULT_PAGE_SIZE = 10;
    var RESOURCES_MAX_PAGE_SIZE = 50;
    var RESOURCES_MIN_PAGE_SIZE = 1;

    describe('In RESMI module, testing pagination', function() {
        var COLLECTION = 'test:CorbelJSObjectPagination' + Date.now();
        var amount = 52;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .should.eventually.be.fulfilled.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.eventually.be.fulfilled.notify(done);
        });

        describe('Collection has pagination and when', function() {

            it('get collection without pagination defined, ' +
                    'successes returning elements in a default page', function(done) {
                corbelDriver.resources.collection(COLLECTION)
                .get()
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get collection with pagination' + 
                    ' successes returning default elements in a especific page', function(done) {
                var params = {
                    pagination: {
                        page: 5
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(2);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get collection with pagination size' +
                    ' successes returning the default page with an specific page size', function(done) {
                var params = {
                    pagination: {
                        pageSize: 3
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(3);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get collection with specific page and page size' +
                    ' successes returning specific number of in a specific page', function(done) {
                var params = {
                    pagination: {
                        page: 1,
                        pageSize: 2
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(2);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get collection with maximum number of elements for page and default page' +
                    ' successes returning maximum page size', function(done) {
                var params = {
                    pagination: {
                        pageSize: RESOURCES_MAX_PAGE_SIZE
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_MAX_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get collection with minimum number of elements for page and default page' +
                    ' successes returning invalid page size', function(done) {
                var params = {
                    pagination: {
                        pageSize: RESOURCES_MIN_PAGE_SIZE
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_MIN_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get collection with specific query and specific number of element in a page' +
                    ' successes returning all resources satisfaying the condition in the request', function(done) {
                var params = {
                    query: [{
                        '$gt': {
                            intField: 700
                        }
                    }],
                    pagination: {
                        pageSize: 3
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    var data = response.data;
                    expect(data.length).to.be.equal(3);
                    response.data.forEach(function(resource) {
                        expect(resource.intField).to.be.above(700);
                    });
                }).
                should.eventually.be.fulfilled.notify(done);
            });


            it('get collection with specific query and' +
                    ' specific number of element in an specific page' +
                    'successes returning all resources satisfaying the condition in the request', function(done) {
                var params = {
                    query: [{
                        '$gt': {
                            intField: 700
                        }
                    }],
                    pagination: {
                        page: 1,
                        pageSize: 3
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(3);
                    response.data.forEach(function(resource) {
                        expect(resource.intField).to.be.above(700);
                    });
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get collection with invalid options in page JSON' + 
                    ' successes returning resources ingnoring invalid options', function(done) {
                var params = {
                    pagination: {
                        badOption: 'bad'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
