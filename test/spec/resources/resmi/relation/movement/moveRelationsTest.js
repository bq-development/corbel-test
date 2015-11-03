describe('In RESOURCES module', function() {

    describe('In RESMI module, testing moveRelation', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSOrderRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSOrderRelationB' + TIMESTAMP;
        var params = {
            sort: {
                '_order': 'asc'
            }
        };
        var amount = 3;
        var idResourceInA;
        var idsResourecesInB;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                idResourceInA = id[0];
                return corbelTest.common.resources.createdObjectsToQuery(corbelDriver,COLLECTION_B, amount)
                .should.be.eventually.fulfilled;
            })
            .then(function(ids) {
                idsResourecesInB = ids;

                return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                (corbelDriver,COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        describe('a relation that does not have parameters', function() {

            it('is moved one position', function(done) {
                var idResource3;
                
                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    idResource3 = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource3, 1)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data[0].id', idResource3);
                })
                .should.notify(done);
            });

            it('move request returns a 400 error if position number is not specified',
            function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    idResource = response.data[0].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('move request returns a 400 error if position number is 0', function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    idResource = response.data[0].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource, 0)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            }); 

            it('move request returns a 400 error if position number is -1', function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    idResource = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource, -1)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });  

            it('move request returns a 400 error if position number is a string', function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    idResource = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource, 'invalidPositionString')
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });  
        });

        describe('a relation that has parameters', function() {

            it('is moved one position', function(done) {
                var idResource3;
                
                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                    .to.be.equal(true);
                    idResource3 = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource3, 1)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data[0].id', idResource3);
                })
                .should.notify(done);
            });

            it('is moved in different positions', function(done) {
                var idResource3;
                var idResourceMiddle;
                var idResourceLast;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                    .to.be.equal(true);
                    idResource3 = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource3, 1)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data[0].id', idResource3);
                    idResourceMiddle = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResourceMiddle, amount)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response.data[amount - 1]).to.have.property('id', idResourceMiddle);
                    idResourceLast = response.data[amount - 1].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResourceLast, 3)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data[2].id', idResourceLast);
                })
                .should.notify(done);
            });

            it('move request returns a 400 error if position number is not specified',
            function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                    .to.be.equal(true);
                    idResource = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('move request returns a 400 error if position number is 0', function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                    .to.be.equal(true);
                    idResource = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource, 0)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });  

            it('move request returns a 400 error if position number is -1', function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                    .to.be.equal(true);
                    idResource = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource, -1)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            }); 

            it('move request returns a 400 error if position number is a string', function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                    .to.be.equal(true);
                    idResource = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource, 'invalidPositionString')
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('move relation from the last position to specific postion over 200 times', function(done) {
                
                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                    .to.be.equal(true);

                    return corbelTest.common.resources.fastMove(corbelDriver,
                    response.data[amount - 1].id, response.data[amount - 2].id,
                    200, COLLECTION_A, idResourceInA, COLLECTION_B)
                    .should.be.eventually.fulfilled;
                })
                .then(function(idResource) {
                    return corbelTest.common.resources.repeatMove(corbelDriver, idResource, 10,
                    COLLECTION_A, idResourceInA, COLLECTION_B, params, amount)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });
        });
    });
});
