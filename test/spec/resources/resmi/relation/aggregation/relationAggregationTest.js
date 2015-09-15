describe('In RESOURCES module ', function() {
    describe('In RESMI module ', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSObjectLinkA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSObjectLinkB' + TIMESTAMP;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        describe('When testing relations aggregation ', function() {
            var amount = 10;
            var idResourceInA;
            var idsResourecesInB;

            beforeEach(function(done) {
                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
                .should.eventually.be.fulfilled
                .then(function(id) {
                    idResourceInA = id[0];
                    return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                    .should.eventually.be.fulfilled;
                })
                .then(function(ids) {
                    idsResourecesInB = ids;

                    return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                        (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            afterEach(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .delete();
                }).
                should.eventually.be.fulfilled.notify(done);
            });

            describe('When performing a GET operation over a relation with aggregation parameters', function() {
                it('All resources are returned.', function(done) {
                    var params = {
                        aggregation: {
                            '$count': '*'
                        }
                    };

                    corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.count).to.be.equal(amount);
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });

            describe('When performing a GET operation over a relation with aggregation & query parameters', function() {
                it('Expected amount of resources are returned', function(done) {
                    var params = {
                        aggregation: {
                            '$count': '*'
                        },
                        query: [{
                            '$lt': {
                                intCount: (amount - 2) * 100
                            }
                        }]
                    };

                    corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.count).to.be.equal(amount - 2);
                    })
                    .should.eventually.be.fulfilled.notify(done);
                });
            });
        });
    });
});
