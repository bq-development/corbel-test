describe('In RESOURCES module', function() {

    describe('In RESMI module, testing moveRelation', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSOrderRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSOrderRelationB' + TIMESTAMP;
        var params = {
            sort: {
                '_order': 'asc'
            }
        };
        var amount = 3;
        var idsResourecesInB = [1, 2, 3];
        var idResourceInA;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    idResourceInA = id[0];

                    return corbelTest.common.resources
                        .createRelationFromSingleObjetToMultipleObject(corbelDriver, COLLECTION_A,
                            idResourceInA, COLLECTION_B, idsResourecesInB)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .delete()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });


        it('move relation from the last position to specific postion over 200 times', function(done) {

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                        .to.be.equal(true);

                    return corbelTest.common.resources.fastMove(corbelDriver,
                            response.data[amount - 1].id, response.data[amount - 2].id,
                            200, COLLECTION_A, idResourceInA, COLLECTION_B)
                        .should.be.eventually.fulfilled;
                })
                .then(function(idResource) {
                    return corbelTest.common.resources.repeatMove(corbelDriver, idResource, 10,
                            COLLECTION_A, idResourceInA, COLLECTION_B, params, amount)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});
