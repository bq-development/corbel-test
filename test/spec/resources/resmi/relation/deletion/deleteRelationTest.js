describe('In RESOURCES module', function() {

    describe('In RESMI module, testing deletion ', function() {
        this.timeout(10000);
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSObjectDeleteCOLLECTION_A' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSObjectDeleteCOLLECTION_B' + TIMESTAMP;

        var TEST_OBJECT = {
            test: 'test'
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        describe('relation can be delete', function() {
            var idResourceA1;
            var idResourceA2;
            var idResourceB;

            beforeEach(function(done) {
                corbelDriver.resources.collection(COLLECTION_A)
                .add(TEST_OBJECT)
                .should.eventually.be.fulfilled
                .then(function(id) {
                    idResourceA1 = id;

                    return corbelDriver.resources.collection(COLLECTION_A)
                    .add(TEST_OBJECT)
                    .should.eventually.be.fulfilled;
                })
                .then(function(id) {
                    idResourceA2 = id;

                    return corbelDriver.resources.collection(COLLECTION_B)
                    .add(TEST_OBJECT)
                    .should.eventually.be.fulfilled;
                })
                .then(function(id) {
                    idResourceB = id;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            afterEach(function(done) {
                corbelDriver.resources.resource(COLLECTION_A, idResourceA1)
                .delete()
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_A, idResourceA2)
                    .delete()
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_B, idResourceB)
                    .delete()
                    .should.eventually.be.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('when request to delete a relation' +
                   ' successes returning NO CONTENT (204) and is idempotent', function(done) {

                corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                .add(idResourceB)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .delete(idResourceB)
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get()
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                expect(response.data).have.length(0);

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .delete(idResourceB).
                    should.eventually.be.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('When request to delete all elements of a relation,' +
                   ' successes returning NO CONTENT (204)', function(done) {
                var amount = 7;
                var idsResourecesInB;

                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.eventually.be.fulfilled
                .then(function(ids) {
                    idsResourecesInB = ids;

                    return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                        (corbelDriver, COLLECTION_A, idResourceA1, COLLECTION_B, idsResourecesInB)
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get()
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data).to.have.property('length').to.be.equal(amount);
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .delete()
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get()
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data).to.have.property('length').to.be.equal(0);

                    return corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                    .should.eventually.be.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('when request to delete element of all relation,' +
                    'successes returning NO CONTENT (204)', function(done) {
                var amount = 7;
                var idsResourecesInB;
                var params = {
                    aggregation: {
                        '$count': '*'
                    }
                };

                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.eventually.be.fulfilled
                .then(function(ids) {
                    idsResourecesInB = ids;

                    return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                        (corbelDriver, COLLECTION_A, idResourceA1, COLLECTION_B, idsResourecesInB)
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                        (corbelDriver, COLLECTION_A, idResourceA2, COLLECTION_B, idsResourecesInB)
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data.count).to.be.equal(amount);
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA2, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data.count).to.be.equal(amount);
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, corbel.Resources.ALL, COLLECTION_B)
                    .delete(idsResourecesInB[0])
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                    .get(null)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data).to.have.length(amount - 1);

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA2, COLLECTION_B)
                    .get(null)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data).to.have.length(amount - 1);

                    return corbelTest.common.resources.deleteCreatedRelationObjects(corbelDriver)
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                    .should.eventually.be.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('when delete realtion with wildcard and any destination' +
                    ' fail with NOT ALLOWED METHOD (405)', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, corbel.Resources.ALL, COLLECTION_B)
                .delete()
                .should.eventually.be.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 405);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('when request to delete a relation with invalid relation id in the relative uri' +
                    ' successes returning NO CONTENT (204) using corbelDriver', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA1, COLLECTION_B)
                .delete('failId')
                .should.eventually.be.fulfilled.notify(done);
            });

            it('When request to delete a relation with invalid relation in the relative uri' +
                    ' successes returning NO CONTENT (204) using corbel driver', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA1, 'test:CorbelJSObjectFail')
                .delete(idResourceB)
                .should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
