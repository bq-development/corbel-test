describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation queries', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP;

        var amount = 5;
        var idResourceInA;
        var idsResourcesInB;

        var punctuationSentence ='José María';
        var specialCharacters = 'ñÑçáéíóúàèìòùâêîôû\'';

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                idResourceInA = id[0];

                return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.be.eventually.fulfilled;
            })
            .then(function(ids) {
                idsResourcesInB = ids;

                return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourcesInB)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        describe('query language equals ', function() {

            it('elements that satisfy the numeric equality are returned', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            intCount: 300
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('intCount', 300);
                    });
                })
                .should.notify(done);
            });

            it('elements that satisfy the string equality are returned', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            stringField: 'stringContent1'
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('stringField', 'stringContent1');
                    });
                })
                .should.notify(done);
            });

            it('elements that satisfy the chain of character equality are returned', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            stringSortCut: 'Test Short Cut'
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('stringSortCut', 'Test Short Cut');
                    });
                })
                .should.notify(done);
            });

            it('elements that satisfy the float equality are returned', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            floatCount: 0.1
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('floatCount', 0.1);
                    });
                })
                .should.notify(done);
            });

            it('elements that satisfy the boolean equality are returned', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            booleanCount: true
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('booleanCount', true);
                    });
                })
                .should.notify(done);
            });

            it('elements that satisfy the ISODate equality are returned', function(done) {
                var isoDate = 'ISODate(' + new Date('15 July 2010 15:05 UTC').toISOString();

                //Extra information on the relation
                var data = {
                    isoDate : isoDate,
                };

                var params = {
                    query: [{
                        '$eq': {
                            isoDate: isoDate
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params);
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[0]);
                })
                .should.notify(done);
            });

            it('elements that satisfy the period equality are returned', function(done) {
                var period = 'Period (P1Y1D)';

                //Extra information on the relation
                var data = {
                    periodField : period,
                };

                var params = {
                    query: [{
                        '$eq': {
                            periodField: period
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params);
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[0]);
                })
                .should.notify(done);
            });

            it('correct elements are returned when querying for special character strings', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            specialCharacters: specialCharacters
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    response.data.forEach(function(element) {
                        expect(element).to.have.property('specialCharacters', specialCharacters);
                    });
                })
                .should.notify(done);
            });

            it('correct elements are returned when querying for punctuation strings', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            punctuationSentence: punctuationSentence
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    response.data.forEach(function(element) {
                        expect(element).to.have.property('punctuationSentence', punctuationSentence);
                    });
                })
                .should.notify(done);
            });
        });

        describe('query language not equal', function() {

            it('int elements not equal to 200 are returned', function(done) {
                var params = {
                    query: [{
                        '$ne': {
                            intCount: 200
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount - 1);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('intCount').and.not.equal(200);
                    });
                })
                .should.notify(done);
            });

            it('string elements not equal to stringContent1 are returned', function(done) {
                var params = {
                    query: [{
                        '$ne': {
                            stringField: 'stringContent1'
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount - 1);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('intCount').and.not.equal('stringContent1');
                    });
                })
                .should.notify(done);
            });

            it('float elements not equal to 0.2 are returned', function(done) {
                var params = {
                    query: [{
                        '$ne': {
                            floatCount: 0.2
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount - 1);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('floatCount').and.not.equal(0.2);
                    });
                })
                .should.notify(done);
            });

            it('false elements are returned, querying for elems not equal to true', function(done) {
                var params = {
                    query: [{
                        '$ne': {
                            booleanCount: true
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                    
                    response.data.forEach(function(element) {
                        expect(element).to.have.property('booleanCount').and.not.equal(true);
                    });
                })
                .should.notify(done);
            });

            it('elements with ISODate not equal to a date, or not ISODate field are returned', function(done) {
                var isoDateBoundary = 'ISODate(' + new Date('15 July 2010 15:05 UTC').toISOString();
                var isoDate1 = 'ISODate(' + new Date('25 July 2010 15:05 UTC').toISOString();
                var isoDate2 = 'ISODate(' + new Date('10 July 2010 15:05 UTC').toISOString();

                var data1 = {
                    isoDate : isoDate1,
                };

                var data2 = {
                    isoDate : isoDate2,
                };

                var params = {
                    query: [{
                        '$ne': {
                            isoDate: isoDateBoundary
                        }
                    }]
                };

                var dataArray = [data1, data2];

                corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
                    COLLECTION_B, idsResourcesInB, dataArray)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params);
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('isoDate').and.not.equal(isoDateBoundary);
                    });
                })
                .should.notify(done);
            });

            it('elements with periodField not equal to P1Y1D, or not periodField field are returned', function(done) {
                var periodBoundary = 'Period (P1Y1D)';
                var period1 = 'Period (P1Y2D)';
                var period2 = 'Period (P1Y1D)';

                var data1 = {
                    periodField : period1,
                };

                var data2 = {
                    periodField : period2,
                };

                var params = {
                    query: [{
                        '$ne': {
                            periodField: periodBoundary
                        }
                    }]
                };

                var dataArray = [data1, data2];

                corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
                    COLLECTION_B, idsResourcesInB, dataArray)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params);
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount - 1);
                    response.data.forEach(function(element) {
                        expect(element).to.have.property('periodField').and.not.equal(periodBoundary);
                    });
                })
                .should.notify(done);
            });

            it('correct elements are returned when querying for special character strings', function(done) {
                var params = {
                    query: [{
                        '$ne': {
                            specialCharacters: specialCharacters
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                    response.data.forEach(function(element) {
                        expect(element).to.have.property('specialCharacters', specialCharacters);
                    });
                })
                .should.notify(done);
            });

            it('correct elements are returned when querying for punctuation strings', function(done) {
                var params = {
                    query: [{
                        '$ne': {
                            punctuationSentence: punctuationSentence
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                    response.data.forEach(function(element) {
                        expect(element).to.have.property('punctuationSentence', punctuationSentence);
                    });
                })
                .should.notify(done);
            });
        });
    });
});