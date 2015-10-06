describe('In RESOURCES module', function() {
    var corbelDriver;

    before(function() {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    describe('In RESMI module, while testing collection aggregation,', function() {
        var COLLECTION = 'test:CorbelJSObjectCollectionAggregation' + Date.now();
        var amount = 50;
        var sum = 25 * 155 / 3;

        beforeEach(function(done) {
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when performing a GET operation over the collection', function(){

            it('in the count aggregation case, all the elements in the collection are returned', function(done) {
                var params = {
                    aggregation: {
                        '$count': '*'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.count', amount);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it.skip('in the min aggregation case, the match element is returned', function(done) {
                var params = {
                    aggregation: {
                        '$min': 'intField'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.min', 100);
                })
                .should.notify(done);
            });

            it.skip('in the max aggregation case, the match element is returned', function(done) {
                var params = {
                    aggregation: {
                        '$max': 'intField'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.max', amount * 100);
                })
                .should.notify(done);
            });

            it.skip('with max aggregation over a query, the match element is returned', function(done) {
                var params = {
                    aggregation: {
                        '$max': 'intField'
                    },
                    query: [{
                        '$lte': {
                            intField: 1000
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.max', 1000);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it.skip('with min aggregation over a query, the match element is returned', function(done) {
                var params = {
                    aggregation: {
                        '$min': 'intField'
                    },
                    query: [{
                        '$gte': {
                            intField: 1000
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.min', 1000);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('with count aggregation over a query, the elements that match the query are returned', function(done) {
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
                    expect(response).to.have.deep.property('data.count', 1);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('with sum aggregation, the expected sum is returned', function(done) {
                var params = {
                    aggregation: {
                        '$sum': 'computableField'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.sum').to.be.closeTo(sum, 0.000000000001);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('with sum aggregation applied on a non numeric field, 0 is returned', function(done) {
                var params = {
                    aggregation: {
                        '$sum': 'stringSortCut'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.sum', 0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('with average aggregation, the expected average is returned', function(done) {
                var params = {
                    aggregation: {
                        '$avg': 'computableField'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.average').to.be.closeTo(sum / amount, 0.000000000001);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('with average aggregation applied on a non numeric field, 0 is returned', function(done) {
                var params = {
                    aggregation: {
                        '$avg': 'stringSortCut'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.average', 0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('when the object is empty, an error is returned', function(done) {
                var params = {
                    aggregation: {}
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                })
                .should.be.eventually.fulfilled.notify(done);
            });

            it('when there are more than one operator, an error is returned', function(done) {
                var params = {
                    aggregation: {
                        '$avg': 'xxxxx',
                        '$sum': 'xxxxx'
                    }
                };
                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                })
                .should.be.eventually.fulfilled.notify(done);
            });

            it('with agreggation, query and sorts, sort param is ignored', function(done) {
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
                    expect(response).to.have.deep.property('data.count', 1);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });
    });
});
