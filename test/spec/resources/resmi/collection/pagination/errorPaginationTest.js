describe('In RESOURCES module', function() {
    var corbelDriver;
    var RESOURCES_DEFAULT_PAGE_SIZE = 10;
    var RESOURCES_MAX_PAGE_SIZE = 50;
    var RESOURCES_MIN_PAGE_SIZE = 1;
    
    describe('In RESMI module', function() {

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        var COLLECTION = 'test:CorbelJSObjectPagination';

        describe('Collection has pagination and when', function() {

            describe('get collection with page size greater than maximum number of elements for page', function() {

                it('fails returning BAD REQUEST (400) invalid page size', function(done) {
                    var params = {
                        pagination: {
                            size: RESOURCES_MAX_PAGE_SIZE + 1
                        }
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.to.eventually.be.rejected
                    .then(function(e) {
                        //TODO send an object instead of string to avoid parse
                        var error = JSON.parse(e.data.responseText);

                        expect(e).to.have.property('status', 400);
                        expect(error).to.have.property('error', 'invalid_page_size');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection with page size less than minimum number of elements for page', function() {

                it('fails returning BAD REQUEST (400) invalid page size', function(done) {
                    var params = {
                        pagination: {
                            size: -1
                        }
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.to.eventually.be.rejected
                    .then(function(e) {
                        //TODO send an object instead of string to avoid parse
                        var error = JSON.parse(e.data.responseText);

                        expect(e).to.have.property('status', 400);
                        expect(error).to.have.property('error', 'invalid_page_size');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection with string page value', function() {

                it('fails returning BAD REQUEST (400)', function(done) {
                    var params = {
                        pagination: {
                            page: 'siete'
                        }
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.to.eventually.be.rejected
                    .then(function(e) {
                        //TODO send an object instead of string to avoid parse
                        var error = JSON.parse(e.data.responseText);

                        expect(e).to.have.property('status', 400);
                        expect(error).to.have.property('error', 'bad_request');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection with string size value', function() {

                it('fails returning BAD REQUEST (400)', function(done) {
                    var params = {
                        pagination: {
                            size: 'cuatro'
                        }
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.to.eventually.be.rejected
                    .then(function(e) {
                        //TODO send an object instead of string to avoid parse
                        var error = JSON.parse(e.data.responseText);

                        expect(e).to.have.property('status', 400);
                        expect(error).to.have.property('error', 'bad_request');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection with invalid page value', function() {
                
                it('fails returning BAD REQUEST (400) invalid page size', function(done) {
                    var params = {
                        pagination: {
                            page: -1
                        }
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.to.eventually.be.rejected
                    .then(function(e) {
                        //TODO send an object instead of string to avoid parse
                        var error = JSON.parse(e.data.responseText);

                        expect(e).to.have.property('status', 400);
                        expect(error).to.have.property('error', 'invalid_page');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection with invalid query and' +
                   ' specific number of element in an specific page', function() {

                it('fails returning BAD REQUEST (400)', function(done) {
                    var params = {
                        query: [{
                            'error': {
                                intField: 700
                            }
                        }],
                        pagination: {
                            page: 1,
                            size: 21
                        }
                    };

                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.to.eventually.be.rejected
                    .then(function(e) {
                        //TODO send an object instead of string to avoid parse
                        var error = JSON.parse(e.data.responseText);

                        expect(e).to.have.property('status', 400);
                        expect(error).to.have.property('error', 'invalid_query');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });
        });
    });
});
