describe('In RESOURCES module', function() {

    describe('In RESMI module', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectQuery' + Date.now();

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        describe('Collection has sort and when', function() {
            var amount = 10;

            before(function(done) {
                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
                .should.eventually.be.fulfilled.notify(done);
            });

            after(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.eventually.be.fulfilled.notify(done);
            });

            describe('get collection with sort order', function() {

                describe('by a numeric field', function() {

                    it('successes returning list of elements sorting ascendent when use asc', function(done) {
                        var params = {
                            sort: {
                                intField: 'asc'
                            }
                        };

                        corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data).have.length(amount);
                            expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'))
                                .to.be.equal(true);
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });

                    it('successes returning list of elements sorting descendent when use desc', function(done) {
                        var params = {
                            sort: {
                                intField: 'desc'
                            }
                        };

                        corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data).have.length(amount);
                            expect(corbelTest.common.resources.checkSortingDesc(response.data, 'intField'))
                                .to.be.equal(true);
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('by a String field', function() {

                    it('successes returning list of elements sorting ascendent when use asc', function(done) {
                        var params = {
                            sort: {
                                stringField: 'asc'
                            }
                        };

                        corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data).have.length(amount);
                            expect(corbelTest.common.resources.checkSortingAsc(response.data, 'stringField'))
                                .to.be.equal(true);
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });

                    it('successes returning list of elements sorting descendent when use desc', function(done) {
                        var params = {
                            sort: {
                                stringField: 'desc'
                            }
                        };

                        corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data).have.length(amount);
                            expect(corbelTest.common.resources.checkSortingDesc(response.data, 'stringField'))
                                .to.be.equal(true);
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('and query operator', function() {

                    it('successes returning list ascendent of elements satisfying' +
                           ' the condition in the request', function(done) {
                        var params = {
                            sort: {
                                stringField: 'asc'
                            },
                            query: [{
                                '$gt': {
                                    intField: 700
                                }
                            }]
                        };

                        corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(corbelTest.common.resources.checkSortingAsc(response.data, 'stringField'))
                                .to.be.equal(true);
                            response.data.forEach(function(resource) {
                                expect(resource.intField).to.be.above(700);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });

                    it('successes returning list descendent of elements satisfying' +
                           ' the condition in the request', function(done) {
                        var params = {
                            sort: {
                                stringField: 'desc'
                            },
                            query: [{
                                '$gt': {
                                    intField: 700
                                }
                            }]
                        };

                        corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(corbelTest.common.resources.checkSortingDesc(response.data, 'stringField'))
                                .to.be.equal(true);
                            response.data.forEach(function(resource) {
                                expect(resource.intField).to.be.above(700);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });
            });
        });
    });
});
