/*jslint maxlen: 50000 */
/* jshint camelcase:false */
describe('In RESOURCES module', function() {
    this.timeout(90000);

    describe('In RESMI module, testing relation search, ', function() {

        describe('when applying search over different indexes', function() {
            var corbelDriver;
            var COLLECTION_A = 'test:differentIndexesCollectionA';
            var COLLECTION_B = 'test:differentIndexesCollectionB';
            var random = Date.now();
            var timeout = 3000;
            var idResource = random + '1';
            var MAX_RETRY = 30;
            var RETRY_PERIOD = 1;
            var punctText = 'La sombra. Celín. Tropiquillos. Theros.';
            var specialCharacters = 'äâêíìéè';

            var object1 = {
                fineGrainField: 'todo nada',
                coarseGrainField: 'un libra sobre las grandes cosas de la vida',
                sortIntegerField: 1
            };
            
            var object2 = {
                fineGrainField: 'cien años de soledad',
                coarseGrainField: 'el realismo magico de garcia marquez en el pueblo de macondo',
                sortIntegerField: 3
            };
            
            var object3 = {
                fineGrainField: 'la templanza librada',
                coarseGrainField: 'fortuna que levantó tras años de tesón',
                sortIntegerField: 3
            };

            var cleanUpResponseData = function(data){
                data.forEach(function(entry) {
                    delete entry.links;
                    delete entry._src_id;
                    delete entry.id;
                });
            };

            before(function(done) {
                var dataArray = [object1, object2, object3];
                var ids = [random + '1', random + '2', random + '3'];

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

            after(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                    .delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });
            
            it('search over fineGrainField partials words should match', function(done) {
                var params = {
                    search: 'fineGrainField:odo nad',
                    indexFieldsOnly: true
                };
                
                setTimeout(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        cleanUpResponseData(response.data);
                        expect(response).to.have.deep.property('data.length', 1);
                        expect(response.data).to.include(object1);
                    })
                    .should.be.eventually.fulfilled
                    .then(function() {
                        params = {
                            search: 'fineGrainField:año sol',
                            indexFieldsOnly: true
                        };
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B).get(null, params);
                    })
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        cleanUpResponseData(response.data);
                        expect(response).to.have.deep.property('data.length', 1);
                        expect(response.data).to.include(object2);
                    })
                    .should.be.eventually.fulfilled
                    .then(function() {
                        params = {
                            search: 'fineGrainField:la templa',
                            indexFieldsOnly: true
                        };
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B).get(null, params);
                    })
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        cleanUpResponseData(response.data);
                        expect(response).to.have.deep.property('data.length', 1);
                        expect(response.data).to.include(object3);
                    })
                    .should.notify(done);
                },timeout);
            });
            
            it('search over fineGrainField partial word should match', function(done) {
                var params = {
                    search: 'fineGrainField:do',
                    indexFieldsOnly: true
                };
                
                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        cleanUpResponseData(response.data);
                        expect(response).to.have.deep.property('data.length', 1);
                        expect(response.data).to.include(object1);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('search over coarseGrainField partial word should not match', function(done) {
                var params = {
                    search: 'coarseGrainField:macon',
                    indexFieldsOnly: true
                };
                
                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        cleanUpResponseData(response.data);
                        expect(response).to.have.deep.property('data.length', 0);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('composed search over defined fields should match', function(done) {
                var params = {
                    search: 'fineGrainField:libra OR coarseGrainField:libra',
                    indexFieldsOnly: true
                };
                
                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        cleanUpResponseData(response.data);
                        expect(response).to.have.deep.property('data.length', 2);
                        expect(response.data).to.include(object1);
                        expect(response.data).to.include(object3);
                    })
                    .should.notify(done);
                },timeout);
            });
        });
    });
});
