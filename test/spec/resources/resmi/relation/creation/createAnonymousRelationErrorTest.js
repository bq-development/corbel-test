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

            it('400 is returned creating an anonymous relation with extra data with unexistent resource id', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', RELATION_NAME)
                .addAnonymous(jsonRelationData)
                .should.be.eventually.rejected.then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'bad_request');
                })
                .should.notify(done);
            });

            it('400 is returned creating an anonymous relation without extra data with unexistent resource id', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', RELATION_NAME)
                .addAnonymous()
                .should.be.eventually.rejected.then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'bad_request');
                })
                .should.notify(done);
            });

            it('400 is returned creating an anonymous relation with unexistent resource id and empty relation data', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', RELATION_NAME)
                .addAnonymous()
                .should.be.eventually.rejected.then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'bad_request');
                })
                .should.notify(done);
            });

            it('422 is returned creating an anonymous relation with malformed relation data', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA , RELATION_NAME)
                .addAnonymous('MALFORMED')
                .should.be.eventually.rejected.then(function(e) {
                    expect(e).to.have.property('status', 422);
                    expect(e.data).to.have.property('error', 'invalid_entity');
                })
                .should.notify(done);
            });
        });
    });
});
