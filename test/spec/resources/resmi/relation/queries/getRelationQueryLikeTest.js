describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation queries', function() {

        describe('query language like', function() {
            var corbelDriver;
            var TIMESTAMP = Date.now();
            var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP;
            var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP;

            var amount = 5;
            var idResourceInA;
            var idsResourcesInB;
            
            var punctuationSentence ='José María';
            var specialCharacters = 'ñÑçáéíóúàèìòùâêîôû\'';

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

            it('elements that satisfy the regex sintax are returned', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringField: '[A-Za-z]*1[0-9]*'
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('stringField', 'stringContent1');
                    });
                })
                .should.notify(done);
            });

            it('elements that satisfy string field are returned', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringField: 'stringContent1'
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);

                    response.data.forEach(function(element) {
                        expect(element).to.have.property('stringField', 'stringContent1');
                    });
                })
                .should.notify(done);
            });

            it('elements where stringSortCut contains Test string are returned', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringSortCut: 'Test'
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    response.data.forEach(function(element) {
                        expect(element).to.have.property('stringSortCut').and.contain('Test');
                    });
                })
                .should.notify(done);
            });

            it('no elements are returned when querying for an invalid regex', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            stringField: '[0-9]++'
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

            it('correct elements are returned when querying for special character strings', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            specialCharacters: specialCharacters
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    response.data.forEach(function(element) {
                        expect(element).to.have.property('specialCharacters', specialCharacters);
                    });
                })
                .should.notify(done);
            });

            it('correct elements are returned when querying for punctuation strings', function(done) {
                var params = {
                    query: [{
                        '$like': {
                            punctuationSentence: punctuationSentence
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    response.data.forEach(function(element) {
                        expect(element).to.have.property('punctuationSentence', punctuationSentence);
                    });
                })
                .should.notify(done);
            });
        });
    });
});