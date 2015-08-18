describe('In RESOURCES module', function() {
    var corbelDriver;

    before(function() {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    describe('In RESMI module, testing aggregation,', function() {
        var COLLECTION = 'test:CorbelJSObjectAggregation' + Date.now();
        var amount = 50;
        var sum = 25 * 155 / 3;

        before(function(done) {

            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .should.eventually.be.fulfilled.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.eventually.be.fulfilled
            .should.eventually.be.fulfilled.notify(done);
        });


        describe('if we get the collection with count aggregation', function() {

            it('successes returning number elements in the collection', function(done) {
                var params = {
                    aggregation: {
                        '$count': '*'
                    }
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled.
                then(function(result) {
                    expect(result.data).to.have.property('count').to.be.equal(amount);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });

        describe('if we get the collection with count aggregation and a query', function() {

            it('successes returning number elements that match the query', function(done) {
                var params = {
                    aggregation: {
                        '$count': '*'
                    },
                    query: [{
                        '$eq': {
                            intField: 1000
                        }
                    }]
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(result) {
                    expect(result.data).to.have.property('count').to.be.equal(1);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });

        describe('if we get the collection with sum aggregation', function() {

            it('successes returning the expected sum', function(done) {
                var params = {
                    aggregation: {
                        '$sum': 'computableField'
                    }
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(result) {
                    expect(result.data).to.have.property('sum').to.be.closeTo(sum, 0.000000000001);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('returns 0 when applied on a non numeric field', function(done) {
                var params = {
                    aggregation: {
                        '$sum': 'stringSortCut'
                    }
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(result) {
                    expect(result.data).to.have.property('sum').to.be.equal(0);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });

        describe('if we get the collection with average aggregation', function() {

            it('successes returning the expected average', function(done) {
                var params = {
                    aggregation: {
                        '$avg': 'computableField'
                    }
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(result) {
                    expect(result.data).to.have.property('average').to.be.closeTo(sum / amount, 0.000000000001);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('returns 0 when applied on a non numeric field', function(done) {
                var params = {
                    aggregation: {
                        '$avg': 'stringSortCut'
                    }
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(result) {
                    expect(result.data).to.have.property('average').to.be.equal(0);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });

        describe('it we get collection with wrong aggregation parameters', function() {

            it('returns an error when object is empty', function(done) {
                var params = {
                    aggregation: {}
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('returns an error when there are more than one operator', function(done) {
                var params = {
                    aggregation: {
                        '$avg': 'xxxxx',
                        '$sum': 'xxxxx'
                    }
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });

        describe('if we get the collection with agreggation, and also with query and sort', function() {

            it('successes ignoring sort param', function(done) {
                var params = {
                    sort: {
                        intField: 'asc'
                    },
                    aggregation: {
                        '$count': 'intField'
                    },
                    query: [{
                        '$eq': {
                            intField: 1000
                        }
                    }]
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(result) {
                    expect(result.data).to.have.property('count').to.be.equal(1);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
