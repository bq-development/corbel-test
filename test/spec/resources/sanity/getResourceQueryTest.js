describe('In RESOURCES module', function() {
    describe('In RESMI module', function() {

        var COLLECTION_NAME_QUERY = 'test:TestObjectProd';
        var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;
        var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
        var corbelDriver;

        before(function(done){
          corbelDriver = corbelTest.getCustomDriver(prodIamUser);
          corbelDriver.iam.token().create()
          .should.be.eventually.fulfilled.and.should.notify(done);
        });

        describe('Collection has queries and when', function() {

            describe('Get collection using the query language equals', function() {
                it('[SANITY] successes returning elements satisfying ', function(done) {
                    var params = {
                        query: [{
                            '$eq': {
                                intField: 1000
                            }
                        }]
                    };
                    
                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length').to.be.equal(1);
                        expect(response).to.have.deep.property('data[0].intField').to.be.equal(1000);
                    })
                    .should.notify(done);
                });

                it('[SANITY] successes returning elements satisfying the String equality', function(done) {
                    var params = {
                        query: [{
                            '$eq': {
                                stringField: 'stringFieldContent10'
                            }
                        }]
                    };
                    
                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length').to.be.equal(1);
                        expect(response).to.have.deep.property('data[0].stringField', 'stringFieldContent10');
                    })
                    .should.notify(done);
                });

                it('[SANITY] successes returning elements satisfying the String equality with complex string',
                    function(done) {
                    
                    var params = {
                        query: [{
                            '$eq': {
                                codingTest: 'ñÑçáéíóúàèìòùâêîôû'
                            }
                        }]
                    };
                    
                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 10);
                        expect(response).to.have.deep.property('data[0].codingTest', 'ñÑçáéíóúàèìòùâêîôû');
                    })
                    .should.notify(done);
                });

                it('[SANITY] successes returning elements satisfying the chain of character equality', function(done) {
                    var params = {
                        query: [{
                            '$eq': {
                                stringSortCut: 'Test Short Cut'
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 10);
                        response.data.forEach(function(element) {
                            expect(element.stringSortCut).to.be.equal('Test Short Cut');
                        });
                    })
                    .should.notify(done);
                });
            });
            
            describe('Get collection using the query language greater than', function() {
                it('[SANITY] successes returning elements satisfying intField greater than 700', function(done) {
                    var params = {
                        query: [{
                            '$gt': {
                                intField: 700
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 3);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.be.above(700);
                        });
                    })
                    .should.notify(done);
                });

                it('[SANITY] successes returning elements satisfying the request intField equal or greater than 700',
                    function(done) {
                    
                    var params = {
                        query: [{
                            '$gte': {
                                intField: 700
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 4);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.be.above(600);
                        });
                    })
                    .should.notify(done);
                });
            });

            describe('Get collection using the query language less than', function() {
                it('[SANITY] successes returning elements satisfying intField less than 300', function(done) {
                    var params = {
                        query: [{
                            '$lt': {
                                intField: 300
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 2);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.be.below(300);
                        });
                    })
                    .should.notify(done);
                });

                it('[SANITY] successes returning elements satisfying the request intField equal or less than 300', 
                    function(done) {
                    
                    var params = {
                        query: [{
                            '$lte': {
                                intField: 300
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 3);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.be.below(400);
                        });
                    })
                    .should.notify(done);
                });
            });

            describe(' Get collection using the query language greater and less than equals', function() {
                it('[SANITY] successes returning elements satisfying the request', function(done) {
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

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 3);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.within(300, 500);
                        });
                    })
                    .should.notify(done);
                });
            });

            describe('Get collection using the query language equals and query in', function() {
                it('[SANITY] successes returning elements satisfying the request', function(done) {
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

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 1);
                        var element = response.data[0];
                        expect(element.intField).to.be.equal(800);
                        expect(element.ObjectNumber).to.be.equal(8);
                    })
                    .should.notify(done);
                });
            });

            describe('Get collection using the query language contains element', function() {
                it('[SANITY] successes returning elements satisfying the request', function(done) {
                    var params = {
                        query: [{
                            '$in': {
                                ObjectNumber: [2, 3]
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 2);
                        expect(response).to.have.deep.property('data[0].ObjectNumber', 2);
                        expect(response).to.have.deep.property('data[1].ObjectNumber', 3);
                    })
                    .should.notify(done);
                });
            });

            describe('Get collection using the query language not equal', function() {
                it('[SANITY] successes returning elements satisfying the reques wtith intField different of 500',
                 function(done) {
                    var params = {
                        query: [{
                            '$ne': {
                                intField: 500
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 9);
                        response.data.forEach(function(element) {
                            expect(element.intField).not.be.equal(500);
                        });
                    })
                    .should.notify(done);
                });
            });

            describe('Get collection using the query language like with a regular expression', function() {
                it('[SANITY] successes returning elements satisfying the request pattern of StringField'
                    +' equals [A-Za-z]*1[0-9]*', function(done) {

                    var params = {
                        query: [{
                            '$like': {
                                stringField: '[A-Za-z]*1[0-9]*'
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length').to.be.above(0);
                        response.data.forEach(function(resource) {
                            resource.stringField.match('[A-Za-z]*1[0-9]*');
                        });
                    })
                    .should.notify(done);
                });
            });

            describe('Get collection using the query language like', function() {
                it('[SANITY] successes returning elements satisfying the request ', function(done) {
                    var params = {
                        query: [{
                            '$like': {
                                stringSortCut: 'test'
                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        response.data.forEach(function(element) {
                            expect(element.stringSortCut.toLowerCase()).to.contain('test');
                        });
                    })
                    .should.notify(done);
                });
            });

            describe('Get collection using match element in array using like ', function() {
                it('[SANITY] successes returning elements satisfying the request', function(done) {
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

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        response.data.forEach(function(element) {
                            expect(element.ObjectMatch.some(function containBasic(element) {
                                return (element.name === 'basic');
                            })).to.be.equal(true);
                        });
                    })
                    .should.notify(done);
                });
            });

            describe('Get collection using invalid format query', function() {
                it('[SANITY] fails returning BAD request (400) invalid query ', function(done) {
                    var params = {
                        query: [{
                            '$gt': {

                            }
                        }]
                    };

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.rejected
                    .then(function(response) {
                        expect(response).to.have.property('status', 400);
                        expect(response).to.have.deep.property('data.error', 'invalid_query');
                    })
                    .should.notify(done);
                });

                it('[SANITY] in one of queries fails returning BAD request (400) invalid query ', function(done) {
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

                    corbelDriver.resources.collection(COLLECTION_NAME_QUERY).get(params, 'application/json')
                    .should.be.eventually.rejected
                    .then(function(response) {
                        expect(response).to.have.property('status', 400);
                        expect(response).to.have.deep.property('data.error', 'invalid_query');
                    })
                    .should.notify(done);
                });
            });
        });
    });
});

