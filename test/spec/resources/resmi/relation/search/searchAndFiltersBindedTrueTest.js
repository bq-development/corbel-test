describe('In RESOURCES module', function() {
    this.timeout(90000);

    describe('In RESMI module, testing relation search, ', function() {

        describe('with binded set to true and applying search and filters', function() {
            var corbelDriver;
            var COLLECTION_A = 'test:searchableCollectionA';
            var COLLECTION_B = 'test:searchableCollectionB';
            var random = Date.now();
            var timeout = 5000;
            var idResource = random + '1';
            var MAX_RETRY = 30;
            var RETRY_PERIOD = 1;
            var punctText = 'La sombra. Celín. Tropiquillos. Theros.';
            var specialCharacters = 'äâêíìéè';

            var object1 = {
                field1: 'Test' + random,
                description: 'And this is the first resource',
                sortField: 10
            };
            
            var object2 = {
                field2: 'tEst' + random,
                description: 'And this is the second resource',
                punctuationTest: specialCharacters + random,
                sortField: 9
            };
            
            var object3 = {
                field3: 'teSt' + random,
                description: 'And this is the third resource',
                punctuationTest: punctText + random,
                sortField: 6
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
            
            it('sorted elements are returned trying to search and sort at the same time', function(done) {
                var params = {
                    search: 'test' + random,
                    sort: {
                        sortField: 'asc'
                    },
                    binded: true
                };
                
                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 3);
                        expect(response).to.have.deep.property('data[0].sortField', 6);
                        expect(response).to.have.deep.property('data[1].sortField', 9);
                        expect(response).to.have.deep.property('data[2].sortField', 10);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying an aggregation filter', function(done) {
                var params = {
                    search: 'test' + random,
                    aggregation: {
                        '$count': '*'
                    },
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.count', 3);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying gt query filter', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$gt': {
                            sortField: 9
                        }
                    }],
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 1);
                        expect(response).to.have.deep.property('data[0].sortField').and.to.be.above(9);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying gte query filter', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$gte': {
                            sortField: 9
                        }
                    }],
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 2);

                        response.data.forEach(function(element) {
                            expect(element).to.have.deep.property('sortField').and.to.be.at.least(9);
                        });
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying lt query filter', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$lt': {
                            sortField: 9
                        }
                    }],
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 1);
                        expect(response).to.have.deep.property('data[0].sortField').and.to.be.below(9);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying lte query filter', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$lte': {
                            sortField: 9
                        }
                    }],
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 2);

                        response.data.forEach(function(element) {
                            expect(element).to.have.deep.property('sortField').and.to.be.below(10);
                        });
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying eq query filter', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$eq': {
                            description: 'And this is the first resource'
                        }
                    }],
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 1);
                        expect(response).to.have.deep.property('data[0].description', 'And this is the first resource');
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying ne query filter', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$ne': {
                            description: 'And this is the first resource'
                        }
                    }],
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 2);

                        response.data.forEach(function(element) {
                            expect(element).to.have.deep.property('data.description')
                            .and.not.equal('And this is the first resource');
                        });
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying exists query filter', function(done) {
                var incompleteChain = 'reso';
                
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$exists': {
                            description: true
                        }
                    }],
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 3);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying in query filter', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$in': {
                            sortField: [9]
                        }
                    }],
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 1);
                        expect(response).to.have.deep.property('data[0].sortField', 9);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('correct results are returned searching and applying nin query filter', function(done) {
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$nin': {
                            sortField: [9, 10]
                        }
                    }],
                    binded: true
                };

                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 1);
                        expect(response).to.have.deep.property('data[0].sortField', 6);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('404 bad request is returned searching and applying like query filter', function(done) {
                var incompleteChain = 'reso';
                
                var params = {
                    search: 'test' + random,
                    query: [{
                        '$like': {
                            description: incompleteChain
                        }
                    }],
                    binded: true
                };

                corbelDriver.resources.relation(COLLECTION_A, idResource, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'bad_request');
                })
                .should.notify(done);
            });
        });
    });
});
