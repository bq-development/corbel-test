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
            .should.eventually.be.fulfilled
            .then(function(id) {
                idResourceInA = id[0];

                return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.eventually.be.fulfilled;
            })
            .then(function(ids) {
                idsResourecesInB = ids;

                return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB)
                .should.eventually.be.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('should be able to use timestamp parameter in queries', function(done){
            var date;
            var queryParams;

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, null)
            .should.eventually.be.fulfilled
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
                expect(response.data.length).to.be.equal(amount);

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
                expect(response.data.length).to.be.equal(amount);

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
                expect(response.data.length).to.be.equal(0);

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
                expect(response.data.length).to.be.equal(0);
            })
            .should.eventually.be.fulfilled.notify(done);
        });

        it('should be able to use ISODate parameter in queries', function(done){
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
            .get(null, null)
            .should.eventually.be.fulfilled
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
                expect(response.data.length).to.be.equal(amount);

                date = 'ISODate(' + new Date(datemillis + 10000).toISOString() + ')';
                queryParams = {
                    query: [{
                        '$lt': {
                            _updatedAt : date
                        }
                    }]
                };

                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, queryParams)
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                expect(response.data.length).to.be.equal(amount);

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
                expect(response.data.length).to.be.equal(0);

                date = 'ISODate(' + new Date(datemillis - 10000).toISOString() + ')';
                queryParams = {
                    query: [{
                        '$lt': {
                            _updatedAt : date
                        }
                    }]
                };

                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, queryParams)
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                expect(response.data.length).to.be.equal(0);
            })
            .should.eventually.be.fulfilled.notify(done);
        });

        it('should create a new registry in the relation in order to check dates in milliseconds', function(done){
            var date;

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, null)
            .should.eventually.be.fulfilled
            .then(function(response) {
                date = response.data[0]._updatedAt;

                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, null)
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                expect(response.data.length).to.be.equal(amount);
                expect(response).to.have.deep.property('data[0]._createdAt')
                .to.be.equals(response.data[0]._updatedAt);

                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourecesInB[0], {
                    myextrafield : date
                })
                .should.eventually.be.fulfilled;
            })
            .then(function(response){
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(idsResourecesInB[0]);
            })
            .should.eventually.be.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.myextrafield').to.be.equals(date);
                expect(response).to.have.deep.property('data._createdAt')
                .to.be.not.equals(response.data._updatedAt);
                done();
            })
            .should.eventually.be.fulfilled.notify(done);
        });

        it('should create a new registry in the relation in order to check dates in ISODate', function(done){
            var date;

            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, null)
            .should.eventually.be.fulfilled
            .then(function(response) {
                date = response.data[0]._updatedAt;

                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, null)
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                expect(response.data.length).to.be.equal(amount);
                expect(response).to.have.deep.property('data[0]._createdAt')
                .to.be.equals(response.data[0]._updatedAt);

                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .add(idsResourecesInB[0], {
                    myextrafield : 'ISODate(' + new Date( date ).toISOString() + ')'
                })
                .should.eventually.be.fulfilled;
            })
            .then(function(response){
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(idsResourecesInB[0]);
            })
            .should.eventually.be.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.myextrafield').to.be.equals(date);
                expect(response).to.have.deep.property('data._createdAt')
                .to.be.not.equals(response.data._updatedAt);
                done();
            })
            .should.eventually.be.fulfilled.notify(done);
        });

    });
});
