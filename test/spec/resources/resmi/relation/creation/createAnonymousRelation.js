describe('In RESOURCES module', function() {

    describe('In RESMI module ', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSRELATION_ANONYMOUS' + TIMESTAMP;
        var RELATION_NAME = 'RELATION_NAME' + TIMESTAMP;
        var TEST_OBJECT = {
            test: 'test'
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        describe('when testing AnonymusRelation creation', function() {
            var idResourceA = 0;
            var jsonRelationData = {
                stringField: 'testCreateRelation'
            };
            var jsonRelationData2 = {
                stringField: 'testCreateRelation2'
            };

            beforeEach(function(done) {
                corbelDriver.resources.collection(COLLECTION_A).add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    idResourceA = id;
                })
                .should.be.eventually.fulfilled.notify(done);
            });

            afterEach(function(done) {
                corbelDriver.resources.resource(COLLECTION_A, idResourceA)
                .delete()
                .should.be.eventually.fulfilled.notify(done);
            });

            it('an anonymous relation without extra data can be created', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA, RELATION_NAME)
                .addAnonymous()
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, RELATION_NAME)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response.data[0]._order).to.be.equal(1);
                })
                .should.notify(done);
            });

            it('an anonymous relation with extra data can be created', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA, RELATION_NAME)
                .addAnonymous(jsonRelationData)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, RELATION_NAME)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data[0].stringField', 'testCreateRelation');
                    expect(response.data[0]._order).to.be.equal(1);
                })
                .should.notify(done);
            });

            it('an anonymus relation with extra data can be created and updated', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA, RELATION_NAME)
                .addAnonymous(jsonRelationData)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, RELATION_NAME)
                    .addAnonymous(jsonRelationData2)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, RELATION_NAME)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data[0].stringField', 'testCreateRelation');
                    expect(response).to.have.deep.property('data[0]._order', 1);
                    expect(response).to.have.deep.property('data[1].stringField', 'testCreateRelation2');
                    expect(response).to.have.deep.property('data[1]._order', 2);
                })
                .should.notify(done);
            });
        });
    });
});
