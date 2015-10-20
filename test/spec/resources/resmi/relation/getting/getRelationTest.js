describe('In RESOURCES module', function() {

    describe('In RESMI module, testing get relation', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CoreJSObjectLinkA' + TIMESTAMP;
        var COLLECTION_B = 'test:CoreJSObjectLinkB' + TIMESTAMP;
        var idResourceA;
        var idResourceB;
        var idResourceC;

        var TEST_OBJECT = {
            test: 'test'
        };

        var jsonRelationData = {
            stringField: 'testCreateRelation'
        };

        var params = {
            aggregation: {
                '$count': '*'
            }
        };

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelDriver.resources.collection(COLLECTION_A)
            .add(TEST_OBJECT)
            .should.be.eventually.fulfilled
            .then(function(id) {
                idResourceA = id;

                return corbelDriver.resources.collection(COLLECTION_B)
                .add(TEST_OBJECT)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                idResourceB = id;

                return corbelDriver.resources.collection(COLLECTION_B)
                .add(TEST_OBJECT)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                idResourceC = id;

                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .add(idResourceB, jsonRelationData)
                .should.be.eventually.fulfilled;
                })
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .add(idResourceC, jsonRelationData)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_A, idResourceA)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_B, idResourceB)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_B, idResourceC)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('all elements of a relation are returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
            .get(null)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data).to.have.length(2);
                expect(response.data[0]).to.have.property('stringField', jsonRelationData.stringField);
                expect(response.data[1]).to.have.property('stringField', jsonRelationData.stringField);
            })
            .should.notify(done);
        });

        it('an specific element of the relation is returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
            .get(idResourceB)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data.stringField).to.be.equal(jsonRelationData.stringField);
            })
            .should.notify(done);
        });

        it('if the relation does not exist, when getting all elements, an empty list is returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', COLLECTION_B)
            .get(null)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data).to.have.property('length').to.be.equal(0);
            })
            .should.notify(done);
        });

        it('if the relation does not exist, 404 is returned trying to get an element', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', COLLECTION_B)
            .get(idResourceB)
            .should.be.eventually.rejected
            .then(function(response) {
                expect(response).to.have.property('status', 404);
                expect(response).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('when trying to get a non existing resource from an existing relation, 404 is returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
            .get('notExistingId')
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('when trying to get a non existing resource from a non existing relation, 404 is returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', COLLECTION_B)
            .get('notExistingId')
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
