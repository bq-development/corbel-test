describe('In RESOURCES module ', function() {

    describe('In RESMI module, while testing anonymous relation creation ', function() {
        var corbelDriver;

        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CreateAnonymousRelationError' + Date.now();
        var RELATION_NAME = 'relationName' + TIMESTAMP;
        var TEST_OBJECT = {
            test: 'test'
        };

        var resourceIdA;
        var jsonRelationData = {
            stringField: 'testCreateRelation'
        };
        var jsonRelationData2 = {
            stringField: 'testCreateRelation2'
        };

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelDriver.resources.collection(COLLECTION_A)
            .add(TEST_OBJECT)
            .should.be.eventually.fulfilled
            .then(function(id) {
                resourceIdA = id;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(COLLECTION_A, resourceIdA)
            .delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('400 is returned creating an anonymous relation with non-existent resource id & data', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', RELATION_NAME)
            .addAnonymous(jsonRelationData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'bad_request');
            })
            .should.notify(done);
        });

        it('400 is returned creating an anonymous relation with non-existent resource id & no data', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', RELATION_NAME)
            .addAnonymous()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'bad_request');
            })
            .should.notify(done);
        });

        it('400 is returned creating an anonymous relation with non-existent collection', function(done) {
            corbelDriver.resources.relation('test:non-existent', resourceIdA , RELATION_NAME)
            .addAnonymous()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e.data).to.have.property('error', 'bad_request');
            })
            .should.notify(done);
        });

        it('422 is returned creating an anonymous relation with malformed relation data', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA , RELATION_NAME)
            .addAnonymous('MALFORMED')
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e.data).to.have.property('error', 'invalid_entity');
            })
            .should.notify(done);
        });
    });
});
