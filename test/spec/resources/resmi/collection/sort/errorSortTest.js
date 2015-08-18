describe('In RESOURCES module', function() {

    describe('In RESMI module, testing sort,', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectQuery' + Date.now();

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        describe('collection has sort and when', function() {

            describe('request using incorrect sorting sort=bad', function() {

                it('fails returning BAD REQUEST (400) using Corbeljs', function(done) {
                    var params = {
                        sort: {
                            stringField: 'BAD'
                        }
                    };

                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.data).to.have.property('error', 'invalid_sort');
                    }).
                    should.eventually.be.fulfilled.notify(done);
                });

                it(', with correct json but diferent structure,' +
                       ' fails returning BAD REQUEST (400)', function(done) {
                    var params = {
                        sort: {
                            '$gt': {
                                stringField: 'something'
                            }
                        }
                    };

                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.data).to.have.property('error', 'invalid_sort');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it('fails returning BAD REQUEST (400) driver directly', function(done) {
                    var query = 'api:sort={stringField:"BAD"}';
                    var token = corbelDriver.config.config.iamToken.accessToken;

                    corbelTest.common.resources.getResource(token, COLLECTION, query)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.response.body).to.have.property('error', 'invalid_sort');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('request using incorrect sorting BAD_REQUEST = 1', function() {

                it('fails returning BAD REQUEST (400) using Corbeljs', function(done) {
                    var params = {sort : {
                                    BAD_REQUEST : 1
                                    }
                                  }; 

                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.data).to.have.property('error', 'invalid_sort');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it('successes returning resouces using driver directly', function(done) {
                    var query = '{ BAD_REQUEST = 1}';
                    var token = corbelDriver.config.config.iamToken.accessToken;

                    corbelTest.common.resources.getResource(token, COLLECTION, query)
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('request using incorrect sorting bad json, api:sort=BAD_JSON', function() {

                it('fails returning BAD REQUEST (400) using Corejs', function(done) {
                    var params = {
                        sort: 'BAD_JSON'
                    };

                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.data).to.have.property('error', 'invalid_sort');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it('successes returning resouces using driver directly', function(done) {
                    var query = 'api:sort=BAD_JSON';
                    var token = corbelDriver.config.config.iamToken.accessToken;

                    corbelTest.common.resources.getResource(token, COLLECTION, query)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e.response.body).to.have.property('error', 'invalid_sort');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });
        });
    });
});
