/* jshint camelcase:false */
describe('In RESOURCES module', function() {
    this.timeout(90000);

    describe('In RESMI module, testing relation search, ', function() {

        describe('with indexFieldsOnly parameter set to true', function() {
            var corbelDriver;
            var COLLECTION_A = 'test:searchableCollectionA';
            var COLLECTION_B = 'test:searchableCollectionB';
            var random = Date.now();
            var timeout = 5000;
            var idResource = random + '1';
            var MAX_RETRY = 30;
            var RETRY_PERIOD = 1;
            var punctText = 'La sombra. Celín. Tropiquillos. Theros';
            var specialCharacters = 'äâêíìéè';

            var object1 = {
                field1: 'Test' + random,
                description: 'And this is the first resource',
                sortField: 10,
                notIndexedField: true
            };
            
            var object2 = {
                field2: 'tEst' + random,
                description: 'And this is the second resource',
                punctuationTest: specialCharacters + random,
                sortField: 9,
                notIndexedField: 'hi!'
            };
            
            var object3 = {
                field3: 'teSt' + random,
                description: 'And this is the third resource',
                punctuationTest: punctText + random,
                sortField: 6,
                notIndexedField: 12345
            };

            var cleanUpResponseData = function(data){
                data.forEach(function(entry) {
                    delete entry.links;
                    delete entry._src_id;
                    delete entry._createdAt;
                    delete entry._order;
                    delete entry._updatedAt;
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
                .then(function() {
                    delete object1['notIndexedField'];
                    delete object2['notIndexedField'];
                    delete object3['notIndexedField'];

                    object1.id = COLLECTION_B + '/' + random + '1';
                    object2.id = COLLECTION_B + '/' + random + '2';
                    object3.id = COLLECTION_B + '/' + random + '3';
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
        
            it('elements that contain test plus random number are returned', function(done) {
                var params = {
                    search: 'test' + random,
                    indexFieldsOnly: true
                };

                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                    .get(null, params)
                    .then(function(response) {
                        if (response.data.length !== 3) {
                            return q.reject();
                        } else {
                            return response;
                        }
                    });
                }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);
                    cleanUpResponseData(response.data);

                    expect(response.data).to.include(object1);
                    expect(response.data).to.include(object2);
                    expect(response.data).to.include(object3);

                }).should.notify(done);
            });

            it('correct elements are returned querying for an incomplete string', function(done) {
                var incompleteChain = 'reso';
                var params = {
                    search: incompleteChain,
                    indexFieldsOnly: true
                };

                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                    .get(null, params)
                    .then(function(response) {
                        if (response.data.length === 0) {
                            return q.reject();
                        } else {
                            return response;
                        }
                    });
                }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    response.data.forEach(function(entry) {
                        expect(entry.description).to.contain(incompleteChain);
                        cleanUpResponseData(response.data);

                        expect(response.data).to.include(object1);
                        expect(response.data).to.include(object2);
                        expect(response.data).to.include(object3);
                    });
                })
                .should.notify(done);
            });

            it('elements that satisfy a punctuation search are returned', function(done) {
                var params = {
                    search: punctText + random,
                    indexFieldsOnly: true
                };

                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                    .get(null, params)
                    .then(function(response) {
                        if (response.data.length !== 1) {
                            return Promise.reject();
                        } else {
                            return response;
                        }
                    });
                }, MAX_RETRY, RETRY_PERIOD)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    cleanUpResponseData(response.data);

                    expect(response.data.length).to.be.equal(1);
                    expect(response.data).to.include(object3);
                })
                .should.notify(done);
            });

            it('elements that satisfy a special characters search are returned', function(done) {
                var params = {
                    search: specialCharacters + random,
                    indexFieldsOnly: true
                };

                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                    .get(null, params)
                    .then(function(response) {
                        if (response.data.length !== 1) {
                            return Promise.reject();
                        } else {
                            return response;
                        }
                    });
                }, MAX_RETRY, RETRY_PERIOD)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    cleanUpResponseData(response.data);

                    expect(response.data.length).to.be.equal(1);
                    expect(response.data).to.include(object2);
                })
                .should.notify(done);
            });
        });
    });
});
