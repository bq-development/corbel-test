/*jslint maxlen: 150 */
describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation search, ', function() {

        describe('while testing documents removal in the index', function() {
            var corbelDriver;
            var COLLECTION_A = 'test:searchableCollectionA';
            var COLLECTION_B = 'test:searchableCollectionB';
            var random;
            var idResource = random + '1';
            var MAX_RETRY = 10;
            var RETRY_PERIOD = 1;
            var ids;

            var object1 = {
                field1: 'field'
            };
            
            var object2 = {
                field1: 'field'
            };
            
            var object3 = {
                field1: 'field'
            };

            beforeEach(function(done) {
                random = Date.now();
                var dataArray = [object1, object2, object3];
                ids = [random + '1', random + '2', random + '3'];

                corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

                corbelDriver.resources.resource(COLLECTION_A, idResource)
                .update({})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.resources.addResourcesUsingDataArray(corbelDriver,
                    COLLECTION_A, idResource, COLLECTION_B, ids, dataArray)
                    .should.be.eventually.fulfilled;       
                })
                .should.notify(done);
            });
            
            it('no search results are retrieved after deleting the relation resource and setting indexFieldsOnly to true', function(done) {
                var params = {
                    search: object1.field1,
                    indexFieldsOnly: true
                };
                
                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 3);
                        expect(response).to.have.deep.property('data[0].field1', object1.field1);
                    });
                }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled
                .then(function() {
                    var promises = [];
                    ids.forEach(function(resourceId){
                        var promise = corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                            .delete(resourceId);
                        promises.push(promise);
                    });
                    return Promise.all(promises);
                })
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                            .get(null, params)
                        .should.be.eventually.fulfilled
                        .then(function(response) {
                            expect(response).to.have.deep.property('data.length', 0);
                        });
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });
            
            it('no search results are retrieved after deleting the relation resource and setting indexFieldsOnly to false',
                function(done) {
                var params = {
                    search: object1.field1,
                    indexFieldsOnly: false
                };
                
                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 3);
                        expect(response).to.have.deep.property('data[0].field1', object1.field1);
                    });
                }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled
                .then(function() {
                    var promises = [];
                    ids.forEach(function(resourceId){
                        var promise = corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                            .delete(resourceId);
                        promises.push(promise);
                    });
                    return Promise.all(promises);
                })
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                            .get(null, params)
                        .should.be.eventually.fulfilled
                        .then(function(response) {
                            expect(response).to.have.deep.property('data.length', 0);
                        });
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });
        });
    });
});
