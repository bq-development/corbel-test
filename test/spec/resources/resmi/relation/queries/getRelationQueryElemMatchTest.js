describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation queries, ', function() {

        describe('query language element match', function() {
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

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
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
    });
});