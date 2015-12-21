describe('In RESOURCES module', function() {

    describe('In RESMI module, testing get relation', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:getRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:getRelationB' + TIMESTAMP;
        var resourceIdA;
        var resourceIdB1;
        var resourceIdB2;

        var TEST_OBJECT = {
            test: 'test'
        };

        var jsonRelationData = {
            stringField: 'testGetRelation'
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
                resourceIdA = id;

                return corbelDriver.resources.collection(COLLECTION_B)
                .add(TEST_OBJECT)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                resourceIdB1 = id;

                return corbelDriver.resources.collection(COLLECTION_B)
                .add(TEST_OBJECT)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                resourceIdB2 = id;

                return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                .add(resourceIdB1, jsonRelationData)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                .add(resourceIdB2, jsonRelationData)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_A, resourceIdA)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_B, resourceIdB1)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_B, resourceIdB2)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('all elements of a relation are returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
            .get(null)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.length', 2);
                expect(response).to.have.deep.property('data[0].stringField', jsonRelationData.stringField);
                expect(response).to.have.deep.property('.data[1].stringField', jsonRelationData.stringField);
            })
            .should.notify(done);
        });

        it('an specific element of the relation is returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
            .get(resourceIdB1)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.stringField', jsonRelationData.stringField);
            })
            .should.notify(done);
        });

        it('[UNDER_DEVELOPMENT] relations where destination id is resourceIdB1 are returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, '_', COLLECTION_B)
            .get(resourceIdB1)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', resourceIdA);
                expect(response).to.have.deep.property('data.stringField', jsonRelationData.stringField);
            })
            .should.notify(done);
        });

        it('if the relation does not exist, when getting all elements, an empty list is returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', COLLECTION_B)
            .get(null)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('if the relation does not exist, 404 is returned trying to get an element', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', COLLECTION_B)
            .get(resourceIdB1)
            .should.be.eventually.rejected
            .then(function(response) {
                expect(response).to.have.property('status', 404);
                expect(response).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('when trying to get a non existing resource from an existing relation, 404 is returned', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
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
