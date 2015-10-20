describe('In RESOURCES module', function() {
    describe('In RESMI module, testing relation pagination', function() {
        var corbelDriver;
        var RESOURCES_DEFAULT_PAGE_SIZE = 10;
        var RESOURCES_DEFAULT_PAGE = 0;
        var RESOURCES_MAX_PAGE_SIZE = 50;
        var RESOURCES_MIN_PAGE_SIZE = 1;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP;
        var amount = 52;
        var idResourceInA;
        var idsResourecesInB;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                idResourceInA = id[0];

                return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.be.eventually.fulfilled;
            })
            .then(function(ids) {
                idsResourecesInB = ids;
                return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                    (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('getting a relation without pagination defined returns elements in a default page', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
            })
            .should.notify(done);
        });

        it('getting a relation with specific page and default page size, returns elements in' +
            ' a especific page', function(done) { 
            var params = {
                pagination: {
                    page: 4
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
            })
            .should.notify(done);
        });

        it('getting a relation with specific page and default page size, returns elements in' +
            ' a especific page that is not default size', function(done) { 
            var params = {
                pagination: {
                    page: 5
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response.data.length).to.be.equal(2);
            })
            .should.notify(done);
        });

        it('getting a relation with default page and specific page size ' +
            ' returns specific number of elements', function(done) {
            var params = {
                pagination: {
                    pageSize: 3
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response.data.length).to.be.equal(3);
            })
            .should.notify(done);
        });

        it('getting a relation with specific page and page size query parameter, ' +
            'returns an specific number of elements in a specific page', function(done) {
            var params = {
                pagination: {
                    page: 1,
                    pageSize: 2
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response.data.length).to.be.equal(2);
            })
            .should.notify(done);
        });

        it('getting a relation with specific page and page size query parameter, ' +
            ' the elements returned are paginated properly', function(done) {
            var params = {
                pagination: {
                    // 52 elements / 2 elements per page = 26
                    page: 26,
                    pageSize: 2
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response.data.length).to.be.equal(0);
            })
            .should.notify(done);
        });

        it('getting a relation with maximum number of elements for page and default page, ' +
            'returns maximum number of elements for that page', function(done) {
            var params = {
                pagination: {
                    pageSize: RESOURCES_MAX_PAGE_SIZE
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response.data.length).to.be.equal(RESOURCES_MAX_PAGE_SIZE);
            })
            .should.notify(done);
        });

        it('getting a relation with minimum number of elements for page and default page, ' +
            'returns minimum number of elements for that page', function(done) {
            var params = {
                pagination: {
                    pageSize: RESOURCES_MIN_PAGE_SIZE
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response.data.length).to.be.equal(RESOURCES_MIN_PAGE_SIZE);
            })
            .should.notify(done);
        });

        it('getting a relation with specific query and specific number of elements in a page, ' +
            'returns pageSize number of resources with intField greater than a value', function(done) {
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

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data.length).to.be.equal(3);
                response.data.forEach(function(relation) {
                    expect(relation.intField).to.be.above(700);
                });
            })
            .should.notify(done);
        });

        it('getting a relation with a specific query, specific number of elements in an page,' +
            ' and a specific page that is not default size ' +
            'returns all resources with intField greater than a value', function(done) {
                var params = {
                    query: [{
                        '$gt': {
                            intField: 700
                        }
                    }],
                    pagination: {
                        page: 17,
                        pageSize: 3
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(1);
                    response.data.forEach(function(relation) {
                        expect(relation.intField).to.be.above(700);
                    });
                })
                .should.notify(done);
        });

        it('getting a relation with invalid page size uses default pagination', function(done) {
            var params = {
                pagination: {
                    bad: 'bad'
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
            })
            .should.notify(done);
        });
    });
});
