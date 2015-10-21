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

        it('elems on default page (0) are returned when getting a relation without pagination defined', function(done) {
            
            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', RESOURCES_DEFAULT_PAGE_SIZE);
            })
            .should.notify(done);
        });

        it('default page size number of elements on a page are returned', function(done) { 
            var params = {
                pagination: {
                    page: 4
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', RESOURCES_DEFAULT_PAGE_SIZE);
            })
            .should.notify(done);
        });

        it('correct number of elements on a page different from default size are returned', function(done) { 
            var params = {
                pagination: {
                    page: 5
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', 2);
            })
            .should.notify(done);
        });

        it('correct number of elements on a page different from default page size (50) are returned', function(done) {
            var params = {
                pagination: {
                    pageSize: 3
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', 3);
            })
            .should.notify(done);
        });

        it('correct number of elems on a specific page with a specific pageSize are returned', function(done) {
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
                expect(response).to.have.deep.property('data.length', 2);
            })
            .should.notify(done);
        });

        it('0 elems are returned when getting a number of page that exceeds the limit of pagination', function(done) {
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
                expect(response).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('max number of elems are returned when using the maximum number of elems as pageSize', function(done) {
            var params = {
                pagination: {
                    pageSize: RESOURCES_MAX_PAGE_SIZE
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', RESOURCES_MAX_PAGE_SIZE);
            })
            .should.notify(done);
        });

        it('min number of elems are returned when using the minimum number of elems as pageSize', function(done) {
            var params = {
                pagination: {
                    pageSize: RESOURCES_MIN_PAGE_SIZE
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', RESOURCES_MIN_PAGE_SIZE);
            })
            .should.notify(done);
        });

        it('pageSize number of elems with intField greater than a value are returned', function(done) {
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

        it('elems with intField greater than a value on a page different from pageSize are returned', function(done) {
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
                expect(response).to.have.deep.property('data.length', RESOURCES_DEFAULT_PAGE_SIZE);
            })
            .should.notify(done);
        });
    });
});
