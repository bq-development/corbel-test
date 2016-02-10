describe('In RESOURCES module', function() {
    this.timeout(90000);

    describe('In RESMI module, testing relation search, ', function() {
        var corbelDriver;
        var COLLECTION_A = 'test:searchableCollectionA';
        var COLLECTION_B = 'test:searchableCollectionB';
        var random;
        var MAX_RETRY = 30;
        var RETRY_PERIOD = 1;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            random = Date.now();

            corbelDriver.resources.resource(COLLECTION_A, random + '1')
                .update({})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                        .add(random + '1', {
                            field1: 'Test' + random,
                            notIndexedField: true,
                            description: 'And this is the first resource'
                        })
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                        .add(random + '2', {
                            field2: 'tEst' + random,
                            notIndexedField: 'hi!',
                            description: 'And this is the second resource'
                        })
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                        .add(random + '3', {
                            field3: 'teSt' + random,
                            field2: 'test' + random,
                            notIndexedField: 12345,
                            description: 'And this is the third resource'
                        })
                        .should.be.eventually.fulfilled;
                })
                .should.be.eventually.fulfilled.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                        .delete()
                        .should.be.eventually.fulfilled;
                })
                .should.be.eventually.fulfilled.notify(done);
        });

        describe('when get relation with search', function() {

            it('successes returning elements satisfying the chain of search', function(done) {
                var params = {
                    search: 'test' + random,
                    indexFieldsOnly: true
                };

                return corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                            .get(null, params)
                            .then(function(response) {
                                if (response.data.length !== 3) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(3);
                        response.data.forEach(function(entry) {
                            delete entry.links;
                            delete entry._src_id;
                        });
                        expect(response).to.have.property('data').and.to.include({
                            'id': COLLECTION_B + '/' + random + '1',
                            field1: 'Test' + random,
                            description: 'And this is the first resource'
                        });
                        expect(response.data).to.include({
                            'id': COLLECTION_B + '/' + random + '2',
                            field2: 'tEst' + random,
                            description: 'And this is the second resource'
                        });
                        expect(response.data).to.include({
                            'id': COLLECTION_B + '/' + random + '3',
                            field2: 'test' + random,
                            field3: 'teSt' + random,
                            description: 'And this is the third resource'
                        });

                        params.aggregation = {
                            '$count': '*'
                        };

                        return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                            .get(null, params)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(result) {
                        expect(result.data).to.have.property('count').to.be.equal(3);
                    })
                    .should.be.eventually.fulfilled.notify(done);
            });

            it('returns elements paginated, respecting the elasticsearch order', function(done) {
                var params = {
                    search: 'test' + random,
                    pagination: {
                        pageSize: 2 
                    }
                };
                var timeout = 5000;
                
                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 2);
                        expect(response).to.have.deep.property('data[0].id', COLLECTION_B + '/' + random + '3');
                        params.pagination.page = 1;
                        return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                        .get(null, params)
                        .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 1);
                    })
                    .should.notify(done);
                },timeout);
            });

            it('successes returning satisfying the incomplete chain of search',
                function(done) {
                    var incompleteChain = 'reso'; //incomplete chain "resource"
                    var params = {
                        search: incompleteChain
                    };

                    return corbelTest.common.utils.retry(function() {
                            return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
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
                            });
                        })
                        .should.be.eventually.fulfilled.notify(done);
                });
        });
    });
});
