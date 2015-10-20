describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing collection queries', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectQuery' + Date.now();
        var amount = 10;
        var punctQueryValue = 'La sombra. Celín. Tropiquillos. Theros.';

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when getting a collection including the $size operation in a query', function() {
            it('returns only elements where ObjectNumbers (array) size equals 3',
             function(done) {
                var params = {
                    query: [{
                        '$size': {
                            ObjectNumber: 3
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length',1);
                    expect(response).to.have.deep.property('data[0].ObjectNumber.length',3);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns no elements when size operation is applied to a non-array type field', function(done) {
                var params = {
                    query: [{
                        '$size': {
                            intField: 2
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length',0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using the equals query language', function() {

            it('returns elements satisfying the numeric equality', function(done) {
                var params = {
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
                    expect(response.data.length).to.be.equal(1);
                    expect(response.data[0].intField).to.be.equal(1000);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying the numeric equality in multiple queries', function(done) {
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(2);
                    expect(response.data[0].intField).to.be.equal(100);
                    expect(response.data[1].intField).to.be.equal(200);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying the String equality', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            stringField: 'stringFieldContent10'
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(1);
                    expect(response.data[0].stringField).to.be.equal('stringFieldContent10');
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying the String punctuation equality', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            punctuationTest: punctQueryValue
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                    response.data.forEach(function(resource){
                        expect(resource).to.have.property('punctuationTest', punctQueryValue);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying the String equality' +
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(amount);
                    expect(response.data[0].codingTest).to.be.equal('ñÑçáéíóúàèìòùâêîôû\'');
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying the chain of characters equality', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            stringSortCut: 'Test Short Cut'
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(amount);
                    response.data.forEach(function(element) {
                        expect(element.stringSortCut).to.be.equal('Test Short Cut');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using the "greater than" or "equal or "greater than" query language', function() {

            it('returns elements satisfying intField greater than 700', function(done) {
                var params = {
                    query: [{
                        '$gt': {
                            intField: 700
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(3);
                    response.data.forEach(function(element) {
                        expect(element.intField).to.be.above(700);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(4);
                    response.data.forEach(function(element) {
                        expect(element.intField).to.be.above(699);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using the "less than" or "equal or less than" query language', function() {

            it('returns elements satisfying the request intField' +
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(2);
                    response.data.forEach(function(element) {
                        expect(element.intField).to.be.below(300);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying the request intField' +
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(3);
                    response.data.forEach(function(element) {
                        expect(element.intField).to.be.below(301);
                    });
                }).
                should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using the "greater and less than equals" query language', function() {

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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(3);
                    response.data.forEach(function(element) {
                        expect(element.intField).to.within(300, 500);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using the "equals" and "in" query language', function() {

            it('returns elements satisfying the request', function(done) {
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(1);
                    var element = response.data[0];
                    expect(element.intField).to.be.equal(800);
                    expect(element.ObjectNumber).to.contain(8);
                }).
                should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using the "in" query language', function() {

            it('returns elements satisfying the request', function(done) {
                var params = {
                    query: [{
                        '$in': {
                            ObjectNumber: [2, 3]
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(9);
                    response.data.forEach(function(element) {
                        expect(element.ObjectNumber).to.contain(2, 3);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using the "not in" query language', function() {

            it('returns elements satisfying the request', function(done) {
                var params = {
                    query: [{
                        '$nin': {
                            ObjectNumber: [3]
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(2);
                    response.data.forEach(function(element) {
                        expect(element.ObjectNumber).not.to.contain(3);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using the "not equal" query language', function() {

            it('returns elements satisfying the request with intField' +
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(9);
                    response.data.forEach(function(element) {
                        expect(element.intField).not.be.equal(500);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying the String punctuation equality', function(done) {
                var params = {
                    query: [{
                        '$ne': {
                            punctuationTest: punctQueryValue
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

        });

        describe('when get collection using the "like" query language', function() {

            it('returns elements satisfying the request with regular expression', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringField: '[A-Za-z]*1[0-9]*'
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data).to.have.length.above(0);
                    response.data.forEach(function(resource) {
                        resource.stringField.match('[A-Za-z]*1[0-9]*');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('successes returning elements satisfying the request pattern of StringField' +
                   ' containing an escaped regexs special character', function(done) {

                var id;
                var updateParams = { stringField : 'qwer$qwer' };
                var params = {
                    query: [{
                        '$like': {
                            stringField: '\\$'
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response){
                    id = response.data[0].id;

                    return corbelDriver.resources.resource(COLLECTION, id)
                    .update(updateParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response.data).to.have.length(1);
                    expect(response.data[0].stringField.match('\\$').length).to.be.above(0);
                })
                .should.notify(done);
            });

            it('returns elements satisfying the request ', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringSortCut: 'test'
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    response.data.forEach(function(element) {
                        expect(element.stringSortCut.toLowerCase()).to.contain('test');
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying the String punctuation request', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            punctuationTest: 'La sombra. Cel'
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 10);
                    response.data.forEach(function(resource){
                        expect(resource).to.have.property('punctuationTest', punctQueryValue);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying the request, which contains an array', function(done) {
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    response.data.forEach(function(element) {
                        expect(element.ObjectMatch.some(function containBasic(element) {
                            return (element.name === 'basic');
                        }))
                        .to.be.equal(true);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using sorting,pagination and query', function() {

            it('returns the list with the number of resources', function(done) {
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(3);
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'))
                        .to.be.equal(true);
                    response.data.forEach(function(element) {
                        expect(element.intField).to.be.below(500);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when get collection using invalid format query', function() {

            it('fails returning BAD request (400) invalid query ', function(done) {
                var params = {
                    query: [{
                        '$gt': {

                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_query');
                }).
                should.be.eventually.fulfilled.and.notify(done);
            });

            it('in one of the queries fails returning BAD request (400) invalid query ', function(done) {
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_query');
                }).
                should.be.eventually.fulfilled.and.notify(done);
            });
        });
    });
});
