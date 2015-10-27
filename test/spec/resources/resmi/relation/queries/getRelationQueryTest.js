describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation queries, ', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP;

        var amount = 5;
        var idResourceInA;
        var idsResourcesInB;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        before(function(done) {
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].intCount', 300);
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].stringField', 'stringContent1');
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    expect(response).to.have.deep.property('data[0].stringSortCut', 'Test Short Cut');
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].floatCount', 0.1);
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    expect(response).to.have.deep.property('data[0].booleanCount', true);
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
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
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
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[0]);
                })
                .should.notify(done);
            });
        });

        describe('query language greater than', function() {

            it('int elements greater than 200 are returned', function(done) {
                var params = {
                    query: [{
                        '$gt': {
                            intCount: 200
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);

                    response.data.forEach(function(element) {
                        expect(element.intCount).to.be.above(200);
                    });
                })
                .should.notify(done);
            });

            it('string elements greater than a are returned', function(done) {
                var params = {
                    query: [{
                        '$gt': {
                            stringField: 'stringContent3'
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].stringField', 'stringContent4');
                })
                .should.notify(done);
            });

            it('float elements greater than 0.1 are returned', function(done) {
                var params = {
                    query: [{
                        '$gt': {
                            floatCount: 0.1
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);

                    response.data.forEach(function(element) {
                        expect(element.floatCount).to.be.above(0.1);
                    });
                })
                .should.notify(done);
            });

            it('true boolean elements are returned, querying for elems greater than false', function(done) {
                var params = {
                    query: [{
                        '$gt': {
                            booleanCount: false
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);

                    response.data.forEach(function(element) {
                        expect(response).to.have.deep.property('data[0].booleanCount', true);
                    });
                })
                .should.notify(done);
            });

            it('ISODate elements greater than 15 July 2010 15:05 UTC are returned', function(done) {
                var isoDateBoundary = 'ISODate(' + new Date('15 July 2010 15:05 UTC').toISOString();
                var isoDate1 = 'ISODate(' + new Date('25 July 2010 15:05 UTC').toISOString();
                var isoDate2 = 'ISODate(' + new Date('15 July 2010 15:05 UTC').toISOString();

                var data1 = {
                    isoDate : isoDate1,
                };

                var data2 = {
                    isoDate : isoDate2,
                };

                var params = {
                    query: [{
                        '$gt': {
                            isoDate: isoDateBoundary
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[0]);
                })
                .should.notify(done);
            });

            it('elements with periodField greater than P1Y1D are returned', function(done) {
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
                        '$gt': {
                            periodField: periodBoundary
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[0]);
                })
                .should.notify(done);
            });
        });

        describe('query language greater than or equal to a value', function() {

            it('int elements greater than or equal to 200 are returned', function(done) {
                var params = {
                    query: [{
                        '$gte': {
                            intCount: 200
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);

                    response.data.forEach(function(element) {
                        expect(element.intCount).to.be.at.least(200);
                    });
                })
                .should.notify(done);
            });

            it('string elements greater than or equal to stringContent are returned', function(done) {
                var params = {
                    query: [{
                        '$gte': {
                            stringField: 'stringContent'
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 5);
                })
                .should.notify(done);
            });

            it('float elements greater than or equal to 0.1 are returned', function(done) {
                var params = {
                    query: [{
                        '$gte': {
                            floatCount: 0.1
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 4);

                    response.data.forEach(function(element) {
                        expect(element.floatCount).to.be.at.least(0.1);
                    });
                })
                .should.notify(done);
            });

            it('all elements are returned, querying for elems greater than or equal to true', function(done) {
                var params = {
                    query: [{
                        '$gte': {
                            booleanCount: true
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);

                    response.data.forEach(function(element) {
                        expect(response).to.have.deep.property('data[0].booleanCount', true);
                    });
                })
                .should.notify(done);
            });

            it('ISODate elements greater than or equal to 15 July 2010 15:05 UTC are returned', function(done) {
                var isoDateBoundary = 'ISODate(' + new Date('15 July 2010 15:05 UTC').toISOString();
                var isoDate1 = 'ISODate(' + new Date('25 July 2010 15:05 UTC').toISOString();
                var isoDate2 = 'ISODate(' + new Date('15 July 2010 15:05 UTC').toISOString();

                var data1 = {
                    isoDate : isoDate1,
                };

                var data2 = {
                    isoDate : isoDate2,
                };

                var params = {
                    query: [{
                        '$gte': {
                            isoDate: isoDateBoundary
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 2);
                })
                .should.notify(done);
            });

            it('period elements greater than or equal to P1Y1D are returned', function(done) {
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
                        '$gte': {
                            periodField: periodBoundary
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 2);
                })
                .should.notify(done);
            });
        });

        describe('query language field less than', function() {

            it('int elements less than 200 are returned', function(done) {
                var params = {
                    query: [{
                        '$lt': {
                            intCount: 200
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);

                    response.data.forEach(function(element) {
                        expect(element.intCount).to.be.below(200);
                    });
                })
                .should.notify(done);
            });

            it('string elements less than stringContent4 are returned', function(done) {
                var params = {
                    query: [{
                        '$lt': {
                            stringField: 'stringContent1'
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                })
                .should.notify(done);
            });

            it('float elements less than 0.2 are returned', function(done) {
                var params = {
                    query: [{
                        '$lt': {
                            floatCount: 0.2
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);

                    response.data.forEach(function(element) {
                        expect(element.floatCount).to.be.below(0.2);
                    });
                })
                .should.notify(done);
            });

            it('false elements are returned, querying for elems less than true', function(done) {
                var params = {
                    query: [{
                        '$lt': {
                            booleanCount: true
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });

            it('ISODate elements less than 15 July 2010 15:05 UTC are returned', function(done) {
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
                        '$lt': {
                            isoDate: isoDateBoundary
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[1]);
                })
                .should.notify(done);
            });

            it('period elements less than P1Y2D are returned', function(done) {
                var periodBoundary = 'Period (P1Y2D)';
                var period1 = 'Period (P1Y1D)';
                var period2 = 'Period (P1Y2D)';

                var data1 = {
                    periodField : period1,
                };

                var data2 = {
                    periodField : period2,
                };

                var params = {
                    query: [{
                        '$lt': {
                            periodField: periodBoundary
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[0]);
                })
                .should.notify(done);
            });
        });

        describe('query language less than or equal', function() {

            it('int elements less than or equalt to 200 are returned', function(done) {
                var params = {
                    query: [{
                        '$lte': {
                            intCount: 200
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);

                    response.data.forEach(function(element) {
                        expect(element.intCount).to.be.below(300);
                    });
                })
                .should.notify(done);
            });

            it('string elements less than stringContent4 are returned', function(done) {
                var params = {
                    query: [{
                        '$lte': {
                            stringField: 'stringContent1'
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);
                })
                .should.notify(done);
            });

            it('float elements less than or equal to 0.2 are returned', function(done) {
                var params = {
                    query: [{
                        '$lte': {
                            floatCount: 0.2
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);

                    response.data.forEach(function(element) {
                        expect(element.floatCount).to.be.below(0.3);
                    });
                })
                .should.notify(done);
            });

            it('all elements are returned, querying for elems less than or equal to true', function(done) {
                var params = {
                    query: [{
                        '$lte': {
                            booleanCount: true
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.notify(done);
            });

            it('ISODate elements less than or equal to 15 July 2010 15:05 UTC are returned', function(done) {
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
                        '$lte': {
                            isoDate: isoDateBoundary
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + idsResourcesInB[1]);
                })
                .should.notify(done);
            });

            it('period elements less than or equal to P1Y2D are returned', function(done) {
                var periodBoundary = 'Period (P1Y2D)';
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
                        '$lte': {
                            periodField: periodBoundary
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 2);
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount - 1);

                    response.data.forEach(function(element) {
                        expect(element.intCount).not.equal(200);
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount - 1);

                    response.data.forEach(function(element) {
                        expect(element.intCount).not.equal('stringContent1');
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount - 1);

                    response.data.forEach(function(element) {
                        expect(element.floatCount).not.equal(0.2);
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                    
                    response.data.forEach(function(element) {
                        expect(element.booleanCount).not.equal(true);
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount);

                    response.data.forEach(function(element) {
                        expect(element.isoDate).not.equal(isoDateBoundary);
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

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], data1)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .add(idsResourcesInB[1], data2)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount - 1);
                    response.data.forEach(function(element) {
                        expect(element.periodField).not.equal(periodBoundary);
                    });
                })
                .should.notify(done);
            });
        });

        describe('query language in', function() {

            it('returns elements where ObjectNumber elements are in [3,4] array', function(done) {
                var params = {
                    query: [{
                        '$in': {
                            ObjectNumber: [3, 4]
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);
                    response.data.forEach(function(element) {
                        expect(element.ObjectNumber).to.contain(3, 4);
                    });
                })
                .should.notify(done);
            });

            it('does not return elements when querying for elems that are not present in the relation', function(done) {
                var params = {
                    query: [{
                        '$in': {
                            ObjectNumber: [8]
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });

            it('using pagination parameters, elements that satisfy the in query are returned', function(done) {
                var params = {
                    query: [],
                    pagination: {
                        page: 0,
                        pageSize: 20
                    }
                };

                var query = {
                    '$in': {
                        '_dst_id': []
                    }
                };

                for(var i=0;i<500;i++){
                    query['$in']['_dst_id'].push(COLLECTION_B + '/' + idsResourcesInB[0]);
                }

                params.query.push(query);

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                })
                .should.notify(done);
            });
        });

        describe('query language nin', function() {

            it('returns elements where ObjectNumber elements are not in [3] array', function(done) {
                var params = {
                    query: [{
                        '$nin': {
                            ObjectNumber: [3]
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);
                    response.data.forEach(function(element) {
                        expect(element.ObjectNumber).not.to.contain(3);
                    });
                })
                .should.notify(done);
            });

            it('no elements are returned using nin, if all ObjectNumber values are in the array', function(done) {
                var params = {
                    query: [{
                        '$nin': {
                            ObjectNumber: [0, 1, 2, 3, 4]
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });
        });

        describe('query language all', function() {

            it('elements where ObjectNumber contains the array [0,1,2,3,4] are returned', function(done) {
                var params = {
                    query: [{
                        '$all': {
                            ObjectNumber: [0, 1, 2, 3, 4]
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' +
                        idsResourcesInB[amount - 1]);
                })
                .should.notify(done);                
            });
        });

        describe('query language like', function() {

            it('elements that satisfy the regex sintax are returned', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringField: '[A-Za-z]*1[0-9]*'
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].stringField', 'stringContent1');
                })
                .should.notify(done);
            });

            it('elements that satisfy string field are returned', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringField: 'stringContent1'
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].stringField', 'stringContent1');
                })
                .should.notify(done);
            });

            it('elements where stringSortCut contains Test string are returned', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringSortCut: 'Test'
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    response.data.forEach(function(element) {
                        expect(element.stringSortCut).to.contain('Test');
                    });
                })
                .should.notify(done);
            });

            it('no elements are returned when querying for an invalid regex', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringField: '[0-9]++'
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });
        });

        describe('query language element match', function() {

            it('using like, elements that have basic as name value are returned', function(done) {
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    response.data.forEach(function(element) {
                        expect(element.ObjectMatch.some(function containBasic(element) {
                            return (element.name === 'basic');
                        })).is.ok();
                    });
                })
                .should.notify(done);
            });
        });

        describe('query language exists', function() {

            it('elements where stringField exists are returned', function(done) {
                var params = {
                    query: [{
                        '$exists': {
                            stringField: true
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.notify(done);
            });

            it('elements where stringField does not exist are returned', function(done) {
                var params = {
                    query: [{
                        '$exists': {
                            stringField: false
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });

            it('elements where notPresentField does not exist are returned', function(done) {
                var params = {
                    query: [{
                        '$exists': {
                            notPresentField: false
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.notify(done);
            });

            it('elements where notPresentField does not exist are returned', function(done) {
                var params = {
                    query: [{
                        '$exists': {
                            notPresentField: true
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });
        });

        describe('query language size', function() {

            it('elements where ObjectNumber array size is 1 are returned', function(done) {
                var params = {
                    query: [{
                        '$size': {
                            ObjectNumber: 1
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' +
                        idsResourcesInB[0]);
                })
                .should.notify(done);
            });        
        });
        
        describe('when combining query filters', function() {

            it('using gte and lte filters, elems between 200 and 400 are returned', function(done) {
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);
                    response.data.forEach(function(element) {
                        expect(element.intCount).to.within(200, 400);
                    });
                })
                .should.notify(done);
            });

            it('elems with stringSortCut eql to Test Short Cut and ObjectNumber in [3,5] are returned', function(done) {
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);
                    response.data.forEach(function(element) {
                        expect(element).to.have.deep.property('stringSortCut', 'Test Short Cut');
                        expect(element.ObjectNumber).to.contain(3, 5);
                    });
                })
                .should.notify(done);
            });


            it('elements with intCount less than 300 are returned, in intField asc order', function(done) {
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'));
                    response.data.forEach(function(element) {
                        expect(element.intCount).to.be.below(300);
                    });
                }).
                should.notify(done);
            });

            it('query language that contains numeric field equal, pagination and sorting', function(done) {
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
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'));
                    expect(response).to.have.deep.property('data.length', 2);
                    response.data.forEach(function(element) {
                        expect(element.intCount).to.be.below(200);
                    });
                })
                .should.notify(done);
            });
        });

        describe('query language greater than with invalid format query', function() {

            it('400 invalid query is returned when querying for elems greater than []', function(done) {
                var params = {
                    query: [{
                        '$gt': {}
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_query');
                })
                .should.notify(done);
            });

            it('no results are returned when querying for [] array', function(done) {
                var params = {
                    query: [{
                        '$in': {
                            ObjectNumber: []
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });

            it('400 invalid query is returned if one of the filters used in the query is []', function(done) {
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'invalid_query');
                })
                .should.notify(done);
            });
        });
    });
});
