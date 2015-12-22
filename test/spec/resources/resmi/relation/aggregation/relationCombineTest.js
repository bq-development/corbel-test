describe('In RESOURCES module ', function() {

    describe('In RESMI module ', function() {

        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSObjectLinkA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSObjectLinkB' + TIMESTAMP;

        var corbelDriver;
        var extraField = {
            field1: 10,
            field2: 20
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        describe('perfoming combine operations over all resources related to a concrete resource', function() {
            var amount = 10;
            var idResourceInA;
            var idsResourecesInB;

            beforeEach(function(done) {
                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1, extraField)
                    .should.be.eventually.fulfilled
                    .then(function(id) {
                        idResourceInA = id[0];
                        return corbelTest.common.resources
                            .createdObjectsToQuery(corbelDriver, COLLECTION_B, amount, extraField)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(ids) {
                        idsResourecesInB = ids;

                        return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject(corbelDriver,
                            COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB, extraField);
                    })
                    .should.be.eventually.fulfilled.and.notify(done);
            });

            afterEach(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                            .delete();
                    })
                    .should.eventually.be.fulfilled.and.notify(done);
            });

            it('the collection elements with new calculated field are retrieved', function(done) {
                var params = {
                    aggregation: {
                        '$combine': {
                            calculatedField: 'intField * computableField'
                        }
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', amount);
                    })
                    .should.notify(done);
            });

            it('the collection elements with new calculated field using map fields are retrieved',
                function(done) {
                    var params = {
                        aggregation: {
                            '$combine': {
                                calculatedField: 'extra.field1 * extra.field2'
                            }
                        }
                    };

                    corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled
                        .then(function(response) {
                            expect(response).to.have.deep.property('data.length', amount);

                            response.data.forEach(function(element) {
                                expect(element).to.have.deep.property('extra.field1');
                                expect(element).to.have.deep.property('extra.field2');
                                var calculatedFieldValue = element.extra.field1 * element.extra.field2;
                                expect(element).to.have.property('calculatedField', calculatedFieldValue);
                            });
                        })
                        .should.notify(done);
                });

            it('the collection elements with new calculated field sorted ascending are retrieved', function(done) {
                var params = {
                    sort: {
                        calculatedField: 'asc'
                    },
                    aggregation: {
                        '$combine': {
                            calculatedField: 'intField * computableField'
                        }
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', amount);
                        expect(corbelTest.common.resources
                            .checkSortingAsc(response.data, 'calculatedField')).to.be.equal(true);
                    })
                    .should.notify(done);
            });

            it('the collection elements with new calculated field sorted descending are retrieved', function(done) {
                var params = {
                    sort: {
                        calculatedField: 'desc'
                    },
                    aggregation: {
                        '$combine': {
                            calculatedField: 'intField * computableField'
                        }
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', amount);
                        expect(corbelTest.common.resources.checkSortingDesc(response.data, 'calculatedField'))
                            .to.be.equal(true);
                    })
                    .should.notify(done);
            });

            it('elems ordered asc where intField is in [300, 500] are returned with a calculated field',
                function(done) {
                    var params = {
                        query: [{
                            '$gte': {
                                intField: 300
                            }
                        }, {
                            '$lte': {
                                intField: 500
                            }
                        }],
                        sort: {
                            calculatedField: 'desc'
                        },
                        aggregation: {
                            '$combine': {
                                calculatedField: 'intField * computableField'
                            }
                        }
                    };

                    corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled
                        .then(function(response) {
                            expect(response).to.have.deep.property('data.length', 3);
                            expect(corbelTest.common.resources
                                .checkSortingDesc(response.data, 'calculatedField')).to.be.equal(true);

                            response.data.forEach(function(element) {
                                expect(element).to.have.property('intField');
                                expect(element).to.have.property('computableField');
                                expect(element).to.have.property('intField').and.to.be.within(300, 500);
                                var calculatedFieldValue = element.intField * element.computableField;
                                expect(element).to.have.property('calculatedField', calculatedFieldValue);
                            });
                        })
                        .should.notify(done);
                });

            it('no error is returned when requests a relation that does not exists', function(done) {
                corbelDriver.resources.relation('test:RELATION_NULL', idResourceInA, COLLECTION_B)
                    .get()
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 0);
                        expect(response).to.have.property('status', 200);
                    })
                    .should.notify(done);
            });

            it('an error is returned when the operation does not exists', function(done) {
                var params = {
                    aggregation: {
                        '$combine': {
                            calculatedField: 'intField # computableField'
                        }
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.rejected
                    .then(function(response) {
                        expect(response).to.have.property('status', 400);
                        expect(response).to.have.deep.property('data.error', 'invalid_aggregation');
                    })
                    .should.notify(done);
            });

            it('calculatedField is [null] when some field does not exists', function(done) {
                var params = {
                    sort: {
                        calculatedField: 'asc'
                    },
                    aggregation: {
                        '$combine': {
                            calculatedField: 'intField * UNDEFINED'
                        }
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        response.data.forEach(function(element) {
                            expect(element).to.have.property('calculatedField', null);
                        });
                    })
                    .should.notify(done);
            });
        });

    });
});
