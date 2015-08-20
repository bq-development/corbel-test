describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation pagination', function() {
        this.timeout(20000);

        var corbelDriver;
        var RESOURCES_DEFAULT_PAGE_SIZE = 10;
        var RESOURCES_MAX_PAGE_SIZE = 50;
        var RESOURCES_MIN_PAGE_SIZE = 1;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP;
        var amount = 52;
        var idResourceInA;
        var idsResourecesInB;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
            .should.eventually.be.fulfilled
            .then(function(id) {
                idResourceInA = id[0];

                return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.eventually.be.fulfilled;
            })
            .then(function(ids) {
                idsResourecesInB = ids;
                return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                    (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB)
                .should.eventually.be.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .delete()
                .should.eventually.be.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });

        describe('Relation has pagination and when', function() {

            it('get relation without pagination defined,' +
                   ' successes returning elements in a default page', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get relation with specific page and default page size,' +
                    ' successes returning default elements in a especific page', function(done) {
                var params = {
                    page: {
                        page: 1
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get relation with default page and specific number of elements,' +
                   ' successes returning the default page with an specific page size', function(done) {
                var params = {
                    pagination: {
                        pageSize: 3
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(3);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get relation with specific page and page size query parameter, ' +
                    'successes returning specific number of in a specific page', function(done) {
                var params = {
                    pagination: {
                        page: 1,
                        pageSize: 2
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(2);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get relation with maximum number of elements for page and default page, ' +
                    'successes returning invalid page size', function(done) {
                var params = {
                    pagination: {
                        pageSize: RESOURCES_MAX_PAGE_SIZE
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_MAX_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get relation with minimum number of elements for page and default page, ' +
                    'successes returning invalid page size', function(done) {
                var params = {
                    pagination: {
                        pageSize: RESOURCES_MIN_PAGE_SIZE
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_MIN_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get relation with specific query and specific number of element in a page, ' +
                    'successes returning all resources with intField greater than a value', function(done) {
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
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(3);
                    response.data.forEach(function(relation) {
                        expect(relation.intField).to.be.above(700);
                    });
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get relation with specific query and specific number of element in an specific page, ' +
                    'successes returning all resources with intField greater than ' +
                    'a value no more than specific page size', function(done) {
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(3);
                    response.data.forEach(function(relation) {
                        expect(relation.intField).to.be.above(700);
                    });
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('get relation with invalid page size successes returning relation resources', function(done) {
                var params = {
                    pagination: {
                        bad: 'bad'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.eventually.be.fulfilled
                .then(function(response){
                  expect(response.data.length).to.be.equal(RESOURCES_DEFAULT_PAGE_SIZE);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
