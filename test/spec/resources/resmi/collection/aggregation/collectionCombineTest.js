describe('In RESOURCES module', function() {

    describe('In RESMI module using combine operation', function() {

        var COLLECTION = 'test:CombineCollection' + Date.now();
        var corbelDriver;
        var amount = 10;
        var extraField = {
            field1: 10,
            field2: 20
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount, extraField)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('the collection elements with new calculated field are retrieved', function(done) {
            var params = {
                aggregation: {
                    '$combine': {
                        calculatedField: 'intField * computableField'
                    }
                }
            };

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {

                    expect(response).to.have.deep.property('data.length', amount);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('intField');
                        expect(element).to.have.property('computableField');
                        var calculatedFieldValue = element.intField * element.computableField;
                        expect(element).to.have.property('calculatedField', calculatedFieldValue);
                    });

                })
                .should.notify(done);
        });

        it('the collection elements with new calculated field, with sum operator, are retrieved', function(done) {
            var params = {
                aggregation: {
                    '$combine': {
                        calculatedField: 'intField + computableField'
                    }
                }
            };

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {

                    expect(response).to.have.deep.property('data.length', amount);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('intField');
                        expect(element).to.have.property('computableField');
                        var calculatedFieldValue = element.intField + element.computableField;
                        expect(element).to.have.property('calculatedField', calculatedFieldValue);
                    });

                })
                .should.notify(done);
        });

        it('the collection elements with new calculated field using map fields are retrieved', function(done) {
            var params = {
                aggregation: {
                    '$combine': {
                        calculatedField: 'extra.field1 * extra.field2'
                    }
                }
            };

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
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

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
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

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'calculatedField'))
                        .to.be.equal(true);
                })
                .should.notify(done);
        });


        it('elems ordered asc where intField is in [300, 500] are returned with a calculated field', function(done) {
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

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);
                    expect(corbelTest.common.resources
                        .checkSortingDesc(response.data, 'calculatedField')).to.be.equal(true);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('intField');
                        expect(element).to.have.property('computableField');
                        expect(element.intField).to.within(300, 500);
                        var calculatedFieldValue = element.intField * element.computableField;
                        expect(element).to.have.property('calculatedField', calculatedFieldValue);
                    });
                })
                .should.notify(done);
        });

        it('when requests a collection that does not exists, no error is returned', function(done) {
            var params = {};

            corbelDriver.resources.collection('test:COLLECTION_NULL')
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                    expect(response).to.have.property('status', 200);
                })
                .should.notify(done);
        });

        it('when the operation does not exists, an error is returned', function(done) {
            var params = {
                aggregation: {
                    '$combine': {
                        calculatedField: 'intField # computableField'
                    }
                }
            };

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.rejected
                .then(function(response) {
                    expect(response).to.have.property('status', 400);
                    expect(response).to.have.deep.property('data.error', 'invalid_aggregation');
                })
                .should.notify(done);
        });

        it('when some field not exists, calculatedField is [null]', function(done) {
            var params = {
                sort: {
                    calculatedField: 'asc'
                },
                aggregation: {
                    '$combine': {
                        calculatedField: 'intField * undefined'
                    }
                }
            };

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.property('status', 200);
                    response.data.forEach(function (element){
                        expect(element).to.have.property('calculatedField', null);
                    });
                })
                .should.notify(done);
        });



    });

});
