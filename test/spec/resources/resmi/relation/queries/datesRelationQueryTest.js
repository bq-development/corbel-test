describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing relation queries', function() {
        var corbelDriver;
        var COLLECTION_A = 'test:CorbelJSObjectQueryA' + Date.now();
        var COLLECTION_B = 'test:CorbelJSObjectQueryB' + Date.now();
        var amount = 10;
        var count;
        var idResourceInA;
        var idsResourecesInB;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];

            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                idResourceInA = id[0];

                return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.be.eventually.fulfilled;
            })
            .then(function(ids) {
                idsResourecesInB = ids;

                return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB)
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('When timestamp is used', function() {

            it('should be able to use timestamp parameter in queries with $gt creationTime + 10000', function(done){
                var date;
                var queryParams;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response){
                    date = response.data[0]._updatedAt;
                    queryParams = {
                        query: [{
                            '$gt': {
                                _updatedAt : date + 10000
                            }
                        }]
                    };

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('should be able to use timestamp parameter in queries with $gt creationTime - 10000', function(done){
                var date;
                var queryParams;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    date = response.data[0]._updatedAt;
                    queryParams = {
                        query: [{
                            '$gt': {
                                _updatedAt : date - 10000
                            }
                        }]
                    };

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('should be able to use timestamp parameter in queries with $lt creationTime + 10000', function(done){
                var date;
                var queryParams;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response){
                    date = response.data[0]._updatedAt;
                    queryParams = {
                        query: [{
                            '$lt': {
                                _updatedAt : date + 10000
                            }
                        }]
                    };

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('should be able to use timestamp parameter in queries with $lt creationTime - 10000', function(done){
                var date;
                var queryParams;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response){
                    date = response.data[0]._updatedAt;
                    queryParams = {
                        query: [{
                            '$lt': {
                                _updatedAt : date - 10000
                            }
                        }]
                    };

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('When ISODate is used', function() {

            it('should be able to use ISODate parameter in queries with $gt creationTime + 10000', function(done){
                var date;
                var datemillis;
                var queryParams = {
                    query: [{
                        '$gt': {
                            _updatedAt : 1
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    datemillis = response.data[0]._updatedAt;
                    date = 'ISODate(' + new Date(datemillis + 10000).toISOString() + ')';
                    queryParams = {
                        query: [{
                            '$gt': {
                                _updatedAt : date
                            }
                        }]
                    };

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('should be able to use ISODate parameter in queries with $gt creationTime - 10000', function(done){
                var date;
                var datemillis;
                var queryParams = {
                    query: [{
                        '$gt': {
                            _updatedAt : 1
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    datemillis = response.data[0]._updatedAt;
                    date = 'ISODate(' + new Date(datemillis - 10000).toISOString() + ')';
                    queryParams = {
                        query: [{
                            '$gt': {
                                _updatedAt : date
                            }
                        }]
                    };

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('should be able to use ISODate parameter in queries with $lt creationTime + 10000', function(done){
                var date;
                var datemillis;
                var queryParams = {
                    query: [{
                        '$lt': {
                            _updatedAt : 1
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    datemillis = response.data[0]._updatedAt;
                    date = 'ISODate(' + new Date(datemillis + 10000).toISOString() + ')';
                    queryParams = {
                        query: [{
                            '$gt': {
                                _updatedAt : date
                            }
                        }]
                    };

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('should be able to use ISODate parameter in queries with $lt creationTime - 10000', function(done){
                var date;
                var datemillis;
                var queryParams = {
                    query: [{
                        '$lt': {
                            _updatedAt : 1
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    datemillis = response.data[0]._updatedAt;
                    date = 'ISODate(' + new Date(datemillis - 10000).toISOString() + ')';
                    queryParams = {
                        query: [{
                            '$gt': {
                                _updatedAt : date
                            }
                        }]
                    };

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });
    });
});
