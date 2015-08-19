describe('In RESOURCES module', function() {
    var TIMESTAMP = Date.now();
    var COLLECTION_A = 'test:CorbelJSObjectLinkA' + TIMESTAMP;
    var COLLECTION_B = 'test:CorbelJSObjectLinkB' + TIMESTAMP;

    describe('In RESMI module, testing relation aggregation', function() {
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        describe('Relation has aggregation and when', function() {
            var amount = 10;
            var idResourceInA;
            var idsResourecesInB;

            before(function(done) {
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

            after(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .delete();
                }).
                should.eventually.be.fulfilled.notify(done);
            });

            describe('Get relation with aggregation count', function() {

                it('successes returning the count of elements', function(done) {
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

            describe('Get relation with aggregation count and query', function() {

                it('successes returning the count of elements', function(done) {
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
