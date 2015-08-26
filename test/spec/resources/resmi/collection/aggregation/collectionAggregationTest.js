describe('In RESOURCES module', function() {
    var corbelDriver;

    before(function() {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    describe('In RESMI module, testing collection aggregation,', function() {
        var COLLECTION = 'test:CorbelJSObjectCollectionAggregation' + Date.now();
        var amount = 50;
        var sum = 25 * 155 / 3;

        beforeEach(function(done) {
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.eventually.be.fulfilled
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('we get the collection with count aggregation and' +
               ' returns the number of elements in the collection', function(done) {
            var params = {
                aggregation: {
                    '$count': '*'
                }
            };
            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data).to.have.property('count').to.be.equal(amount);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('we get the collection with count aggregation and a query' +
               ' and returns the number of elements that match the query', function(done) {
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
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data).to.have.property('count').to.be.equal(1);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('we get the collection with sum aggregation and returns the expected sum', function(done) {
            var params = {
                aggregation: {
                    '$sum': 'computableField'
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data).to.have.property('sum').to.be.closeTo(sum, 0.000000000001);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('we get the collection with sum aggregation and' +
               ' returns 0 when applied on a non numeric field', function(done) {
            var params = {
                aggregation: {
                    '$sum': 'stringSortCut'
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data).to.have.property('sum').to.be.equal(0);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('we get the collection with average aggregation and returns the expected average', function(done) {
            var params = {
                aggregation: {
                    '$avg': 'computableField'
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data).to.have.property('average').to.be.closeTo(sum / amount, 0.000000000001);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('we get the collection with average aggregation' +
               ' and returns 0 when applied on a non numeric field', function(done) {
            var params = {
                aggregation: {
                    '$avg': 'stringSortCut'
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data).to.have.property('average').to.be.equal(0);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

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

        it('we get the collection with agreggation, query and sorts and ignores sort param', function(done) {
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
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data).to.have.property('count').to.be.equal(1);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
