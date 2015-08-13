describe('In RESOURCES module', function() {

    describe('In RESMI module', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectQuery' + Date.now();
        var amount = 10;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
            corbelTest.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .should.eventually.be.fulfilled.notify(done);
        });

        after(function(done) {
            corbelTest.resources.cleanResourcesQuery(corbelDriver)
            .should.eventually.be.fulfilled
            .should.eventually.be.fulfilled.notify(done);
        });

        describe('Collection has queries and when', function() {

            describe('get collection using the query language equals', function() {

                it('successes returning elements satisfying the numeric equality', function(done) {
                    var params = {
                        query: [{
                            '$eq': {
                                intField: 1000
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(1);
                        expect(response.data[0].intField).to.be.equal(1000);
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it('successes returning elements satisfying the String equality', function(done) {
                    var params = {
                        query: [{
                            '$eq': {
                                stringField: 'stringFieldContent10'
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(1);
                        expect(response.data[0].stringField).to.be.equal('stringFieldContent10');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it('successes returning elements satisfying the String equality' +
                       ' with complex string', function(done) {
                    var params = {
                        query: [{
                            '$eq': {
                                codingTest: 'ñÑçáéíóúàèìòùâêîôû\''
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(amount);
                        expect(response.data[0].codingTest).to.be.equal('ñÑçáéíóúàèìòùâêîôû\'');
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it('successes returning elements satisfying the chain of character equality', function(done) {
                    var params = {
                        query: [{
                            '$eq': {
                                //@todo Check if it is possible 'Test+Short+Cut'
                                stringSortCut: 'Test Short Cut'
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(10);
                        response.data.forEach(function(element) {
                            expect(element.stringSortCut).to.be.equal('Test Short Cut');
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it('successes returning elements satisfying the numeric equality', function(done) {
                    var params = {
                        sort: {
                            intField: 'asc'
                        },
                        queries: [{
                            query: [{
                                '$eq': {
                                    intField: 100
                                }
                            }]
                        }, {
                            query: [{
                                '$eq': {
                                    intField: 200
                                }
                            }]
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(2);
                        expect(response.data[0].intField).to.be.equal(100);
                        expect(response.data[1].intField).to.be.equal(200);
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it.skip('success returning elements satisfying date equality', function(done) {
                    var testDate = new Date(2015, 6, 1).toISOString();

                    var params = {
                        query: [{
                            '$eq': {
                                objectDate: 'ISODate(' + testDate + ')'
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(1);
                        expect(response.data[0].objectDate).to.be.equal(testDate);
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
                
                it.skip('success returning elements(0) satisfying date equality', function(done) {
                    var testDate = new Date(2015, 4, 1).toISOString();

                    var params = {
                        query: [{
                            '$eq': {
                                objectDate: testDate
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(0);
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using the query language greater than', function() {

                it('successes returning elements satisfying intField greater than 700', function(done) {
                    var params = {
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
                        expect(response.data.length).to.be.equal(3);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.be.above(700);
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it('successes returning elements satisfying the request intField' +
                       ' equal or greater than 700', function(done) {
                    var params = {
                        query: [{
                            '$gte': {
                                intField: 700
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(4);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.be.above(600);
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using the query language less than', function() {

                it('successes returning elements satisfying the request intField' +
                       ' less than 300', function(done) {
                    var params = {
                        query: [{
                            '$lt': {
                                intField: 300
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(2);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.be.below(300);
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });

                it('successes returning elements satisfying the request intField' +
                       ' equal or less than 300', function(done) {
                    var params = {
                        query: [{
                            '$lte': {
                                intField: 300
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(3);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.be.below(400);
                        });
                    }).
                    should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using the query language greater and less than equals', function() {

                it('successes returning elements satisfying the request', function(done) {
                    var params = {
                        query: [{
                            '$gte': {
                                intField: 300
                            }
                        }, {
                            '$lte': {
                                intField: 500
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(3);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.within(300, 500);
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using the query language equals and query in', function() {

                it('successes returning elements satisfying the request', function(done) {
                    var params = {
                        query: [{
                            '$eq': {
                                intField: 800
                            }
                        }, {
                            '$in': {
                                ObjectNumber: [7, 8, 9]
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(1);
                        var element = response.data[0];
                        expect(element.intField).to.be.equal(800);
                        expect(element.ObjectNumber).to.contain(8);
                    }).
                    should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using the query language contains element', function() {

                it('successes returning elements satisfying the request', function(done) {
                    var params = {
                        query: [{
                            '$in': {
                                ObjectNumber: [2, 3]
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(9);
                        response.data.forEach(function(element) {
                            expect(element.ObjectNumber).to.contain(2, 3);
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using the query language not contains element', function() {

                it('successes returning elements satisfying the request', function(done) {
                    var params = {
                        query: [{
                            '$nin': {
                                ObjectNumber: [3]
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(2);
                        response.data.forEach(function(element) {
                            expect(element.ObjectNumber).not.to.contain(3);
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using the query language not equal', function() {

                it('successes returning elements satisfying the request with intField' +
                       ' different of 500', function(done) {
                    var params = {
                        query: [{
                            '$ne': {
                                intField: 500
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(9);
                        response.data.forEach(function(element) {
                            expect(element.intField).not.be.equal(500);
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using the query language like with a regular expression', function() {

                it('successes returning elements satisfying the request pattern of StringField' +
                       ' equals [A-Za-z]*1[0-9]*', function(done) {
                    var params = {
                        query: [{
                            '$like': {
                                stringField: '[A-Za-z]*1[0-9]*'
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data).to.have.length.above(0);
                        response.data.forEach(function(resource) {
                            resource.stringField.match('[A-Za-z]*1[0-9]*');
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using the query language like', function() {

                it('successes returning elements satisfying the request ', function(done) {
                    var params = {
                        query: [{
                            '$like': {
                                stringSortCut: 'test'
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        response.data.forEach(function(element) {
                            expect(element.stringSortCut.toLowerCase()).to.contain('test');
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection matching element in array using like ', function() {

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
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        response.data.forEach(function(element) {
                            expect(element.ObjectMatch.some(function containBasic(element) {
                                return (element.name === 'basic');
                            }))
                            .to.be.equal(true);
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using sorting,pagination and query', function() {

                it('successes returning the list with the number of resources', function(done) {
                    var params = {
                        sort: {
                            intField: 'asc'
                        },
                        pagination: {
                            page: 0,
                            pageSize: 3
                        },
                        query: [{
                            '$lt': {
                                intField: 500
                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(3);
                        expect(corbelTest.resources.checkSortingAsc(response.data, 'intField')).to.be.equal(true);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.be.below(500);
                        });
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('get collection using invalid format query', function() {

                it('fails returning BAD request (400) invalid query ', function(done) {
                    var params = {
                        query: [{
                            '$gt': {

                            }
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        var error = e.data;
                        
                        expect(e).to.have.property('status', 400);
                        expect(error).to.have.property('error', 'invalid_query');
                    }).
                    should.eventually.be.fulfilled.notify(done);
                });

                it('in one of queries fails returning BAD request (400) invalid query ', function(done) {
                    var params = {
                        queries: [{
                            query: [{
                                '$gt': {
                                    intField: 500
                                }
                            }]
                        }, {
                            query: [{
                                '$gt': {}
                            }]
                        }]
                    };
                    corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.rejected
                    .then(function(e) {
                        var error = e.data;

                        expect(e).to.have.property('status', 400);
                        expect(error).to.have.property('error', 'invalid_query');
                    }).
                    should.eventually.be.fulfilled.notify(done);
                });
            });
        });
    });
});
