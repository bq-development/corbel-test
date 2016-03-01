describe('In RESOURCES module', function() {
    var corbelDriver;
    var TIMESTAMP = Date.now();
    var COLLECTION_A = 'test:CorbelJSRelationSortA' + TIMESTAMP;
    var COLLECTION_B = 'test:CorbelJSRelationSortB' + TIMESTAMP;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });
    
    describe('In RESMI module, while testing relation sorting operation, ', function() {
        var amount = 5;
        var idResourceInA;
        var idsResourecesInB;

        before(function(done) {
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                idResourceInA = id[0];

                return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount);
            })
            .then(function(ids) {
                idsResourecesInB = ids;

                return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                    (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .delete();
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when getting a relation with sort asc order ', function() {
            it('applied to a numeric field', function(done) {
                var params = {
                    sort: {
                        intField: 'asc'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null ,params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'))
                        .to.be.equal(true);
                })
                .should.notify(done);
            });

            it('applied to a string field', function(done) {
                var params = {
                    sort: {
                        stringField: 'asc'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data).have.length(amount);
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'stringField'))
                        .to.be.equal(true);
                })
                .should.notify(done);
            });

            it('applied to a numeric field with query parameters', function(done) {
                var params = {
                    sort: {
                        stringField: 'asc'
                    },
                    query: [{
                        '$gt': {
                            intField: 700
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'stringField'))
                        .to.be.equal(true);
                    response.data.forEach(function(resource) {
                        expect(resource.intField).to.be.above(700);
                    });
                })
                .should.notify(done);
            });
        });

        describe('when getting a relation with sort desc order ', function() {
            it('applied to a numeric field', function(done) {
                var params = {
                    sort: {
                        intField: 'desc'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null,params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'intField'))
                        .to.be.equal(true);
                })
                .should.notify(done);
            });
            
            it('applied to a string field', function(done) {
                var params = {
                    sort: {
                        stringField: 'desc'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data).have.length(amount);
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'stringField'))
                        .to.be.equal(true);
                })
                .should.notify(done);
            });

            it('applied to a numeric field and aplying query parameters', function(done) {
                var params = {
                    sort: {
                        stringField: 'desc'
                    },
                    query: [{
                        '$gt': {
                            intField: 700
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'stringField'))
                        .to.be.equal(true);
                    response.data.forEach(function(resource) {
                        expect(resource.intField).to.be.above(700);
                    });
                })
                .should.notify(done);
            });
        });


        describe('when getting a relation with invalid sort order ', function() {
            it('400 status error is returned', function(done) {
                var params = {
                    sort: {
                        stringField: 'BAD'
                    }
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_sort');
                })
                .should.notify(done);
            });
        });
    });
});
