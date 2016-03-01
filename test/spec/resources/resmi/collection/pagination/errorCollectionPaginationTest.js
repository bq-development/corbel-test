describe('In RESOURCES module', function() {
    
    describe('In RESMI module, testing pagination', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectCollectionPagination';

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('when get collection with page size greater than maximum number of elements for page,' +
                ' it fails returning BAD REQUEST (400) invalid pageSize', function(done) {
            var params = {
                pagination: {
                    pageSize: corbelTest.CONFIG.GLOBALS.maxPageSize + 1
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'invalid_page_size');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when get collection with page size less than minimum number of elements for page' +
                ' it fails returning BAD REQUEST (400) invalid pageSize', function(done) {
            var params = {
                pagination: {
                    pageSize: corbelTest.CONFIG.GLOBALS.minPageSize - 1
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'invalid_page_size');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when get collection with string page value, it fails returning BAD REQUEST (400)', function(done) {
            var params = {
                pagination: {
                    page: 'siete'
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'bad_request');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when get collection with string size value, it fails returning BAD REQUEST (400)', function(done) {
            var params = {
                pagination: {
                    pageSize: 'cuatro'
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'bad_request');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when get collection with invalid page value,' +
               ' it fails returning BAD REQUEST (400) invalid pageSize', function(done) {
            var params = {
                pagination: {
                    page: -1
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'invalid_page');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when get collection with invalid query and' +
              ' specific number of element in an specific page,' +
                  ' it fails returning BAD REQUEST (400)', function(done) {
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

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'invalid_query');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
