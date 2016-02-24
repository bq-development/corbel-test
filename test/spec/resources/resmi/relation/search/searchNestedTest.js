describe('In RESOURCES module', function() {
    this.timeout(90000);

    describe('In RESMI module, testing relation search, ', function() {

        describe.only('when conditions are applied to nested fields', function() {
            var corbelDriver;
            var COLLECTION_A = 'test:searchableCollectionA';
            var COLLECTION_B = 'test:searchableCollectionB';
            var random = Date.now();
            var timeout = 9000;
            var idResource = random + '1';
            var MAX_RETRY = 30;
            var RETRY_PERIOD = 1;
            var punctText = 'La sombra. Celín. Tropiquillos. Theros.';
            var specialCharacters = 'äâêíìéè';

            var object1 = {
                field1: 'Test' + random,
                nested: {
                    nestedInt: 1,
                    nestedString: 'first nested string',
                    nestedBoolean: true
                },
                description: 'And this is the first resource',
                sortIntegerField: 10
            };
            
            var object2 = {
                field2: 'tEst' + random,
                nested: {
                    nestedInt: 2,
                    nestedString: 'second nested string',
                    nestedBoolean: false
                },
                description: 'And this is the second resource',
                punctuationTest: specialCharacters + random,
                sortIntegerField: 9
            };
            
            var object3 = {
                field3: 'teSt' + random,
                nested: {
                    nestedInt: 3,
                    nestedString: 'third nested string',
                    nestedBoolean: true
                },
                description: 'And this is the third resource',
                punctuationTest: punctText + random,
                sortIntegerField: 6
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
            
            it('when the condition is set to a numeric field', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$gt': {
                            'nested.nestedInt': 1
                        }
                    }],
                    indexFieldsOnly: false
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length',2);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('when the condition is set to a boolean field', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$eq': {
                            'nested.nestedBoolean': false
                        }
                    }],
                    indexFieldsOnly: false
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length',1);
                        expect(response).to.have.deep.property('data[0].description', 'And this is the second resource');
                    })
                    .should.notify(done);
                },timeout);
            });

            it('when the condition is set to a string type field', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$eq': {
                            'nested.nestedString': 'first nested string'
                        }
                    }],
                    indexFieldsOnly: false
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length',1);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('when the condition is set over an array of string', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$in': {
                            'nested.nestedString': ['first nested string']
                        }
                    }],
                    indexFieldsOnly: false
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length',1);
                    })
                    .should.notify(done);
                },timeout);
            });
        });
    });
});
