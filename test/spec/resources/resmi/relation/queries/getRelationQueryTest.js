describe('In RESOURCES module', function() {
    
    describe('In RESMI module, testing relation queries, ', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        describe('Relation has queries and when ', function() {
            var amount = 5;
            var idResourceInA;
            var idsResourecesInB;

            before(function(done) {
                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
                .should.eventually.be.fulfilled
                .then(function(id) {
                    idResourceInA = id[0];

                    return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                    .should.eventually.be.fulfilled;
                })
                .then(function(ids) {
                    idsResourecesInB = ids;

                    return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                        (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB)
                    .should.eventually.be.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            after(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .delete()
                    .should.eventually.be.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            describe('get relation with ', function() {

                describe('query language equals ', function() {

                    it('successes returning elements satisfying the numeric equality', function(done) {
                        var params = {
                            query: [{
                                '$eq': {
                                    intCount: 300
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(1);
                            expect(response.data[0].intCount).to.be.equal(300);
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });

                    it('successes returning elements satisfying the String equality', function(done) {
                        var params = {
                            query: [{
                                '$eq': {
                                    stringField: 'stringContent1'
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(1);
                            expect(response.data[0].stringField).to.be.equal('stringContent1');
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });

                    it('successes returning elements satisfying the chain of character equality', function(done) {
                        var params = {
                            query: [{
                                '$eq': {
                                    stringSortCut: 'Test Short Cut'
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(amount);
                            expect(response.data[0].stringSortCut).to.be.equal('Test Short Cut');
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language greater than', function() {

                    it('successes returning relations objects satisfying the condition in the request', function(done) {
                        var params = {
                            query: [{
                                '$gt': {
                                    intCount: 200
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(2);
                            response.data.forEach(function(element) {
                                expect(element.intCount).to.be.above(200);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language greater than or equal to a value', function() {

                    it('successes returning relations objects satisfying the condition in the request', function(done) {
                        var params = {
                            query: [{
                                '$gte': {
                                    intCount: 200
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(3);
                            response.data.forEach(function(element) {
                                expect(element.intCount).to.be.above(100);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language field less than', function() {

                    it('successes returning relations objects satisfying the condition in the request', function(done) {
                        var params = {
                            query: [{
                                '$lt': {
                                    intCount: 200
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(2);
                            response.data.forEach(function(element) {
                                expect(element.intCount).to.be.below(200);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language less than or equal', function() {

                    it('successes returning relations objects satisfying the condition in the request', function(done) {
                        var params = {
                            query: [{
                                '$lte': {
                                    intCount: 200
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(3);
                            response.data.forEach(function(element) {
                                expect(element.intCount).to.be.below(300);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language greater than and less than or equals', function() {

                    it('successes returning elements satisfying the request', function(done) {
                        var params = {
                                query: [{
                                    '$gte': {
                                        intCount: 200
                                    }
                            }, {
                                    '$lte': {
                                        intCount: 400
                                    }
                                }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(3);
                            response.data.forEach(function(element) {
                                expect(element.intCount).to.within(200, 400);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language not equal', function() {

                    it('successes returning relations objects satisfying the condition in the request', function(done) {
                        var params = {
                            query: [{
                                '$ne': {
                                    intCount: 300
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(4);
                        response.data.forEach(function(element) {
                                expect(element.intCount).not.equal(300);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language like', function() {

                    it('successes returning relations objects satisfying the condition in the request', function(done) {
                        var params = {
                            query: [{
                                '$like': {
                                    stringField: '[A-Za-z]*1[0-9]*'
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(1);
                            expect(response.data[0].stringField).to.be.equal('stringContent1');
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language equals and query in', function() {

                    it('successes returning elements satisfying the request', function(done) {
                        var params = {
                                query: [{
                                    '$eq': {
                                        stringSortCut: 'Test Short Cut'
                                    }
                            }, {
                                    '$in': {
                                        ObjectNumber: [3, 5]
                                    }
                                }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(2);
                            response.data.forEach(function(element) {
                                expect(element.stringSortCut).to.be.equal('Test Short Cut');
                                expect(element.ObjectNumber).to.contain(3, 5);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language in', function() {

                    it('successes returning elements satisfying the request', function(done) {
                        var params = {
                            query: [{
                                '$in': {
                                    ObjectNumber: [3, 4]
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(2);
                            response.data.forEach(function(element) {
                                expect(element.ObjectNumber).to.contain(3, 4);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language nin', function() {

                    it('successes returning elements satisfying the request', function(done) {
                        var params = {
                            query: [{
                                '$nin': {
                                    ObjectNumber: [3]
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(3);
                            response.data.forEach(function(element) {
                                expect(element.ObjectNumber).not.to.contain(3);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language element match element in array using like', function() {

                    it('successes returning elements satisfying the request', function(done) {
                        var params = {
                            query: [{
                                '$elem_match': {
                                    'ObjectMatch': [{
                                        '$like': {
                                            'name': 'basic'
                                        }
                                    }]
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            response.data.forEach(function(element) {
                                expect(element.ObjectMatch.some(function containBasic(element) {
                                    return (element.name === 'basic');
                                })).is.ok();
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language equal and sorting', function() {

                    it('successes returning relations objects satisfying the condition in the request', function(done) {
                        var params = {
                            sort: {
                                intField: 'asc'
                            },
                            query: [{
                                '$lt': {
                                    intCount: 300
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(response.data.length).to.be.equal(3);
                            expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'));
                            response.data.forEach(function(element) {
                                expect(element.intCount).to.be.below(300);
                            });
                        }).
                        should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language like', function() {

                    it('successes returning elements satisfying the request ', function(done) {
                        var params = {
                            query: [{
                                '$like': {
                                    stringSortCut: 'test'
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            response.data.forEach(function(element) {
                                expect(element.stringSortCut).not.be.equal('test');
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language greater than with invalid format query', function() {

                    it('fails returning BAD REQUEST (400) invalid query', function(done) {
                        var params = {
                            query: [{
                                '$gt': {}
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.rejected
                        .then(function(e) {
                            expect(e).to.have.property('status', 400);
                            expect(e.data).to.have.property('error', 'invalid_query');
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('query language that contains numeric field equal, pagination and sorting', function() {

                    it('successes returning relations objects satisfying the condition in the request', function(done) {
                        var params = {
                            sort: {
                                intField: 'asc'
                            },
                            pagination: {
                                page: 0,
                                pageSize: 2
                            },
                            query: [{
                                '$lt': {
                                    intCount: 200
                                }
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.fulfilled
                        .then(function(response) {
                            expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'));
                            expect(response.data.length).to.be.equal(2);
                            response.data.forEach(function(element) {
                                expect(element.intCount).to.be.below(200);
                            });
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });

                describe('get collection using invalid format query', function() {

                    it('in one of queries fails returning BAD request (400) invalid query ', function(done) {
                        var params = {
                            queries: [{
                                query: [{
                                    '$gt': {
                                        intCount: 300
                                    }
                                }]
                            }, {
                                query: [{
                                    '$gt': {}
                                }]
                            }]
                        };

                        corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.eventually.be.rejected
                        .then(function(e) {
                            expect(e).to.have.property('status', 400);
                            expect(e.data).to.have.property('error', 'invalid_query');
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });
                });
            });
        });
    });
});
