describe('In RESOURCES module', function() {

    describe('In RESMI module', function() {
        this.timeout(10000);
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSObjectDeleteCOLLECTION_A' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSObjectDeleteCOLLECTION_B' + TIMESTAMP;

        var TEST_OBJECT = {
            test: 'test'
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        describe('while testing deletion', function() {
            var idResourceA1;
            var idResourceA2;
            var idResourceB;

            beforeEach(function(done) {
                corbelDriver.resources.collection(COLLECTION_A)
                .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    idResourceA1 = id;

                    return corbelDriver.resources.collection(COLLECTION_A)
                    .add(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    idResourceA2 = id;

                    return corbelDriver.resources.collection(COLLECTION_B)
                    .add(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    idResourceB = id;
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                corbelDriver.resources.resource(COLLECTION_A, idResourceA1)
                .delete()
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_A, idResourceA2)
                    .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_B, idResourceB)
                    .delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            it('a registry in a relation is deleted', function(done) {

                corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                .add(idResourceB)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .delete(idResourceB)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .delete(idResourceB).
                    should.eventually.be.fulfilled;
                })
                .should.be.eventually.fulfilled.notify(done);
            });

            it('all registries in a relation are deleted', function(done) {
                var amount = 7;
                var idsResourecesInB;

                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.be.eventually.fulfilled
                .then(function(ids) {
                    idsResourecesInB = ids;

                    return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                        (corbelDriver, COLLECTION_A, idResourceA1, COLLECTION_B, idsResourecesInB)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);

                    return corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            it('an element in all relations is deleted', function(done) {
                var amount = 7;
                var idsResourecesInB;
                var params = {
                    aggregation: {
                        '$count': '*'
                    }
                };

                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.be.eventually.fulfilled
                .then(function(ids) {
                    idsResourecesInB = ids;

                    return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                        (corbelDriver, COLLECTION_A, idResourceA1, COLLECTION_B, idsResourecesInB)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                        (corbelDriver, COLLECTION_A, idResourceA2, COLLECTION_B, idsResourecesInB)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.count', amount);
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA2, COLLECTION_B)
                    .get(null, params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.count', amount);
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, corbel.Resources.ALL, COLLECTION_B)
                    .delete(idsResourecesInB[0])
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get(null)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount - 1);

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA2, COLLECTION_B)
                    .get(null)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount - 1);

                    return corbelTest.common.resources.deleteCreatedRelationObjects(corbelDriver)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            it('when delete realtion with wildcard and any destination' +
                    ' fail with NOT ALLOWED METHOD (405)', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, corbel.Resources.ALL, COLLECTION_B)
                .delete()
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 405);
                })
                .should.be.eventually.fulfilled.notify(done);
            });

            it('a delete relation request with invalid id is successed', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                .delete('failId')
                .should.be.eventually.fulfilled.notify(done);
            });

            it('a delete relation request with invalid relation is successed', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA1, 'test:CorbelJSObjectFail')
                .delete(idResourceB)
                .should.be.eventually.fulfilled.notify(done);
            });
        });
    });
});
