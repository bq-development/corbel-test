describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation queries, ', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP;

        var amount = 5;
        var idResourceInA;
        var idsResourcesInB;

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

        describe('query language greater than', function() {

            it('int elements greater than 200 are returned', function(done) {
                var params = {
                    query: [{
                        '$gt': {
                            intCount: 200
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
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

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
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

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
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

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
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

                var dataArray = [data1, data2];

                corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
                    COLLECTION_B, idsResourcesInB, dataArray)
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

                var dataArray = [data1, data2];

                corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
                    COLLECTION_B, idsResourcesInB, dataArray)
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

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
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

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
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

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
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

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
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

                var dataArray = [data1, data2];

                corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
                    COLLECTION_B, idsResourcesInB, dataArray)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params);
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

                var dataArray = [data1, data2];

                corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver, COLLECTION_A, idResourceInA,
                    COLLECTION_B, idsResourcesInB, dataArray)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params);
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 2);
                })
                .should.notify(done);
            });
        });
    });
});