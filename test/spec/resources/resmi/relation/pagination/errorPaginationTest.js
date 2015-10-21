describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation pagination', function() {
        var corbelDriver;
        var RESOURCES_DEFAULT_PAGE_SIZE = 10;
        var RESOURCES_MAX_PAGE_SIZE = 50;
        var RESOURCES_MIN_PAGE_SIZE = 1;

        var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + Date.now();
        var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + Date.now();

        var idResourceInA = 5;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('404 invalid page size is returned if pageSize is more than max number of page elems 50', function(done) {
            var params = {
                pagination: {
                    pageSize: RESOURCES_MAX_PAGE_SIZE + 1
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'invalid_page_size');
            })
            .should.notify(done);
        });

        it('404 invalid page size is returned if pageSize is less than min number of page elems 0', function(done) {
            var params = {
                pagination: {
                    pageSize: -1
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'invalid_page_size');
            })
            .should.notify(done);
        });

        it('404 invalid page size is returned if pageSize exceeds JS max int value 9007199254740991', function(done) {
            var params = {
                pagination: {
                    pageSize: 9007199254740992
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'bad_request');
            })
            .should.notify(done);
        });

        it('404 invalid page value is returned if page value is -1', function(done) {
            var params = {
                pagination: {
                    page: -1
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'invalid_page');
            })
            .should.notify(done);
        });

        it('404 invalid page is returned if page value exceeds max int value in JS 9007199254740991', function(done) {
            var params = {
                pagination: {
                    page: 9007199254740992
                }
            };

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'bad_request');
            })
            .should.notify(done);
        });

        it('400 invalid_query is returned using an invalid query and specific page number and size', function(done) {
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
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'invalid_query');
            })
            .should.notify(done);
        });
    });
});
