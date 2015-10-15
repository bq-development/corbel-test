describe('In RESOURCES module ', function() {
    describe('In RESMI module ', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSObjectLinkA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSObjectLinkB' + TIMESTAMP;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        describe('when performing a GET operation over an aggregation relation ', function() {
            var amount = 10;
            var idResourceInA;
            var idsResourecesInB;

            var calculeSum = function(data) {
                var calculatedSum = data.reduce(function(sum, data) {
                    return sum + data.intField; 
                }, 0);

                return calculatedSum;
            };

            beforeEach(function(done) {
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
                        (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB);
                })
                .should.be.eventually.fulfilled.notify(done);
            });

            afterEach(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .delete();
                }).
                should.eventually.be.fulfilled.notify(done);
            });

            it('in the count aggregation case, all resources are returned.', function(done) {
                var params = {
                    aggregation: {
                        '$count': '*'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.count).to.be.equal(amount);
                })
                .should.notify(done);
            });


            it('in the count aggregation case, match elements are returned.', function(done) {
                var params = {
                    aggregation: {
                        '$count': 'stringField'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.count', amount);
                })
                .should.notify(done);
            });

            it('with average aggregation, the expected average is returned.', function(done) {
                var params = {
                    aggregation: {
                        '$avg': 'intField'
                    }
                };

                var totalSum;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    totalSum = calculeSum(response.data);
                
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.average').to.be.closeTo(totalSum / amount, 0.000000000001);
                })
                .should.notify(done);
            }); 

            it('with sum aggregation, the expected sum is returned.', function(done) {
                var params = {
                    aggregation: {
                        '$sum': 'intField'
                    }
                };

                var totalSum;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    totalSum = calculeSum(response.data);
                
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.sum').to.be.closeTo(totalSum, 0.000000000001);
                })
                .should.notify(done);
            });

            it('with sum aggregation applied on a non numeric field, 0 is returned.', function(done) {
                var params = {
                    aggregation: {
                        '$sum': 'stringSortCut'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.sum', 0);
                })
                .should.notify(done);
            });

            it('in the min aggregation case, the match element is returned.', function(done) {
                var params = {
                    aggregation: {
                        '$min': 'intCount'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.min', 0);
                })
                .should.notify(done);
            });

            it('in the max aggregation case, the match element is returned.', function(done) {
                var params = {
                    aggregation: {
                        '$max': 'intCount'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.max', 900);
                })
                .should.notify(done);
            });

            it('with max aggregation over a query, the match element is returned.', function(done) {
                var params = {
                    aggregation: {
                        '$max': 'intCount'
                    },
                    query: [{
                        '$lte': {
                            intCount: 900
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.max', 900);
                })
                .should.notify(done);
            });

            it('with min aggregation over a query, the match element is returned.', function(done) {
                var params = {
                    aggregation: {
                        '$min': 'intCount'
                    },
                    query: [{
                        '$gte': {
                            intCount: 900
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.min', 900);
                })
                .should.notify(done);
            });

            it('expected amount of resources are returned using aggregation & query parameters.', function(done) {
                var params = {
                    aggregation: {
                        '$count': '*'
                    },
                    query: [{
                        '$lt': {
                            intCount: (amount - 2) * 100
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.count).to.be.equal(amount - 2);
                })
                .should.notify(done);
            });
        });
    });
});
