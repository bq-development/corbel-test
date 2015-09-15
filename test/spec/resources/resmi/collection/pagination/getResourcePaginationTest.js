describe('In RESOURCES module', function() {
    var corbelDriver;
    var RESOURCES_DEFAULT_PAGE_SIZE = 10;
    var RESOURCES_MAX_PAGE_SIZE = 50;
    var RESOURCES_MIN_PAGE_SIZE = 1;

    describe('In RESMI module', function() {
        var COLLECTION = 'test:CorbelJSObjectPagination' + Date.now();
        var amount = 52;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .should.eventually.be.fulfilled.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.eventually.be.fulfilled.notify(done);
        });

        describe('when testing collections pagination', function() {

            it('collection without pagination parameters returns default number of elements per page', function(done) {
                corbelDriver.resources.collection(COLLECTION)
                .get()
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('collection with pagination parameter returns elements of expected page', function(done) {
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

            it('collection with pageSize parameter returns defined number of elements per page', function(done) {
                var params = {
                    pagination: {
                        pageSize: 3
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data).to.have.property('length', 3);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('collection with page & pageSize parameter returns defined #elems from expected page', function(done) {
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
                  expect(response.data).to.have.property('length', 2);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('collection with maximum value allowed for pageSize returns maximum elements per page', function(done) {
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

            it('collection with minimum value allowed for pageSize returns minimum elements per page', function(done) {
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

            it('collection with query & pageSize params returns elements satisfactorily', function(done) {
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
                    expect(data).to.have.property('length', 3);
                    response.data.forEach(function(resource) {
                        expect(resource).to.have.property('intField').and.be.above(700);
                    });
                }).
                should.eventually.be.fulfilled.notify(done);
            });

            it('collection with query & pagination params returns elements satisfactorily', function(done) {
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
                    expect(response.data).to.have.property('length', 3);
                    response.data.forEach(function(resource) {
                        expect(resource).to.have.property('intField').and.be.above(700);
                    });
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('collection with invalid pagination parameter ignores such parameters', function(done) {
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
