describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation queries, ', function() {

        describe('query language size', function() {
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

            it('elements where ObjectNumber array size is 1 are returned', function(done) {
                var params = {
                    query: [{
                        '$size': {
                            ObjectNumber: 1
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' +
                        idsResourcesInB[0]);
                })
                .should.notify(done);
            });

            it('0 elements are returned querying for a size different from the relation arrays size', function(done) {
                var params = {
                    query: [{
                        '$size': {
                            ObjectNumber: 100
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });

            it('multiple elements are returned querying for a common array size', function(done) {
                var params = {
                    query: [{
                        '$size': {
                            ObjectNumber: 2
                        }
                    }]
                };

                var dataToAdd = {
                    ObjectNumber : [2, 3],
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourcesInB[0], dataToAdd)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params);
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);
                })
                .should.notify(done);
            });       
        });
    });
});