describe('In RESOURCES module', function() {
    var corbelDriver;
    var RESOURCES_DEFAULT_PAGE_SIZE = 10;
    var RESOURCES_MAX_PAGE_SIZE = 50;
    var RESOURCES_MIN_PAGE_SIZE = 1;

    describe('In RESMI module', function() {
        var COLLECTION = 'test:CorbelJSObjectPagination' + Date.now();
        var amount = 52;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
            corbelTest.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .should.eventually.be.fulfilled.notify(done);
        });

        after(function(done) {
            corbelTest.resources.cleanResourcesQuery(corbelDriver)
            .should.eventually.be.fulfilled.notify(done);
        });

        describe('Collection has pagination and when', function() {

            describe('Get collection without pagination defined', function() {

                it('successes returning elements in a default page', function(done) {
                    corbelDriver.resources.collection(COLLECTION)
                    .get()
                    .should.eventually.be.fulfilled
                    .then(function(response){
                      expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('Get collection with pagination', function() {

                it('successes returning default elements in a especific page', function(done) {
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
            });

            describe('Get collection with pagination size', function() {

                it('successes returning the default page with an specific page size', function(done) {
                    var params = {
                        pagination: {
                            size: 3
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
            });

            describe('Get collection with specific page and page size', function() {

                it('successes returning specific number of in a specific page', function(done) {
                    var params = {
                        pagination: {
                            page: 1,
                            size: 2
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
            });

            describe('Get collection with maximum number of elements for page and default page', function() {

                it('successes returning maximum page size', function(done) {
                    var params = {
                        pagination: {
                            size: RESOURCES_MAX_PAGE_SIZE
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
            });

            describe('Get collection with minimum number of elements for page and default page', function() {

                it('successes returning invalid page size', function(done) {
                    var params = {
                        pagination: {
                            size: RESOURCES_MIN_PAGE_SIZE
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
            });

            describe('Get collection with specific query and specific number of element in a page', function() {

                it('successes returning all resources satisfaying the condition in the request', function(done) {
                    var params = {
                        query: [{
                            '$gt': {
                                intField: 700
                            }
                        }],
                        pagination: {
                            size: 3
                        }
                    };

                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        var data = response.data;
                        expect(data.length).to.be.equal(3);
                        expect(data[0].intField).to.be.above(700);
                        expect(data[1].intField).to.be.above(700);
                        expect(data[2].intField).to.be.above(700);
                    }).
                    should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('Get collection with specific query and' +
                   ' specific number of element in an specific page', function() {

                it('successes returning all resources satisfaying the condition in the request', function(done) {
                    var params = {
                        query: [{
                            '$gt': {
                                intField: 700
                            }
                        }],
                        pagination: {
                            page: 1,
                            size: 3
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
            });

            describe('Get collection with invalid options in page JSON', function() {

                it('successes returning resources ingnoring invalid options', function(done) {
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
});
