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
    });
});