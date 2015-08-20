describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation pagination', function() {
        var corbelDriver;
        var RESOURCES_DEFAULT_PAGE_SIZE = 10;
        var RESOURCES_MAX_PAGE_SIZE = 50;
        var RESOURCES_MIN_PAGE_SIZE = 1;

        var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + Date.now();
        var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + Date.now();

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        describe('Relation has pagination and when get relation with ', function() {
            var idResourceInA = 5;

            describe('page size greater than maximum number of elements for page and default page', function() {

                it('fails returning invalid page size', function(done) {
                    var params = {
                        pagination: {
                            pageSize: RESOURCES_MAX_PAGE_SIZE + 1
                        }
                    };

                    corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.data).to.have.property('error', 'invalid_page_size');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('page size less than minimum number of elements for page and default page', function() {
                it('.fails returning invalid page size', function(done) {
                    var params = {
                        pagination: {
                            pageSize: -1
                        }
                    };

                    corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.data).to.have.property('error', 'invalid_page_size');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('invalid page value', function() {

                it('fails returning invalid page size', function(done) {
                    var params = {
                        pagination: {
                            page: -1
                        }
                    };

                    corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.data).to.have.property('error', 'invalid_page');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('invalid query and specific number of element in an specific page', function() {

                it('successes returning all resources with intField' +
                       ' greater than 700 no more than specific page size', function(done) {
                    var params = {
                        query: [{
                            'error': {
                                intField: 700
                            }
                        }],
                        pagination: {
                            page: 1,
                            pageSize: 21
                        }
                    };

                    corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.data).to.have.property('error', 'invalid_query');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });
        });
    });
});
