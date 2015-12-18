describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing anonymous relation creation ', function() {
        var corbelDriver;

        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CreateAnonymousRelationError' + TIMESTAMP;
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
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, RELATION_NAME)
            .delete()
            .should.eventually.be.fulfilled.and.notify(done);
        });

        it('an anonymous relation without extra data can be created', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, RELATION_NAME)
            .addAnonymous()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, RELATION_NAME)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data[0].id', null);
            })
            .should.notify(done);
        });

        it('an anonymous relation with extra data can be created', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, RELATION_NAME)
            .addAnonymous(jsonRelationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, RELATION_NAME)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data[0].stringField', 'testCreateRelation');
                expect(response).to.have.deep.property('data[0].id', null);

                return corbelDriver.resources.collection(COLLECTION_A)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.not.have.deep.property('data.stringField');
            })
            .should.notify(done);
        });

        it('an anonymous relation with extra data can be created and more fields can be added', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, RELATION_NAME)
            .addAnonymous(jsonRelationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, RELATION_NAME)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data[0].stringField', 'testCreateRelation');
                expect(response).to.have.deep.property('data[0].id', null);

                return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, RELATION_NAME)
                .addAnonymous(jsonRelationData2)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, RELATION_NAME)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data[0].stringField', 'testCreateRelation');
                expect(response).to.have.deep.property('data[0].id', null);
                expect(response).to.have.deep.property('data[1].stringField', 'testCreateRelation2');
                expect(response).to.have.deep.property('data[1].id', null);
            })
            .should.notify(done);
        });
    });
});
