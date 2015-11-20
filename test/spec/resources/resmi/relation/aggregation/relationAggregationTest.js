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
                .should.be.eventually.fulfilled.and.notify(done);
            });

            afterEach(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .delete();
                }).
                should.eventually.be.fulfilled.and.notify(done);
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
                    expect(response).to.have.deep.property('data.count', amount);
                })
                .should.notify(done);
            });


            it('in the count aggregation case, matching elements are returned.', function(done) {
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

            it('in histogram aggregation case, the number of occurrences of each value in a field are returned',
                    function(done) {
                var params = {
                    aggregation: {
                        '$histogram': 'stringField'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.property('data').and.to.be.an('array');
                    response.data.map(function(resource){
                        expect(resource).to.have.property('id').and.to.contain('stringContent');
                        expect(resource).to.have.property('count');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('in histogram aggregation case, if the field does not exists, the count is the number of resources',
                    function(done) {
                var params = {
                    aggregation: {
                        '$histogram': 'nonExist'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    response.data.map(function(resource){
                        expect(resource).not.to.have.property('id');
                        expect(resource).to.have.property('count', amount);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('in histogram aggregation case, the number of occurrences in a field that match the query are returned',
                    function(done) {
                var params = {
                    aggregation: {
                        '$histogram': 'intField'
                    },
                    query: [{
                        '$lt': {
                            intField: 1000
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.property('data').and.to.be.an('array');
                    response.data.map(function(resource){
                        expect(resource).to.have.property('id').and.to.be.below(1000);
                        expect(resource).to.have.property('count');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('in histogram aggregation case, the number of occurrences that match the pagination are returned',
                    function(done) {
                var params = {
                    aggregation: {
                        '$histogram': 'stringField'
                    },
                    pagination: {
                        pageSize: 5
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 5);
                    response.data.map(function(resource){
                        expect(resource).to.have.property('id').and.to.contain('stringContent');
                        expect(resource).to.have.property('count');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('with average aggregation, expected average value is returned.', function(done) {
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
                    expect(response).to.have.deep.property('data.average')
                        .to.be.closeTo(totalSum / amount, 0.000000000001);
                })
                .should.notify(done);
            }); 

            it('with sum aggregation, expected sum value is returned.', function(done) {
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

            it('in the min aggregation case, expected match element is returned.', function(done) {
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

            it('in the max aggregation case, expected match element is returned.', function(done) {
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

            it('with max aggregation over a query, expected match element is returned.', function(done) {
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

            it('with min aggregation over a query, expected match element is returned.', function(done) {
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
                            intCount: 800
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.count', 8);
                })
                .should.notify(done);
            });
        });
    });
});
