describe('In RESOURCES module', function() {

    describe('In RESMI module, in createAnonymusRelation ', function() {
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

        describe('an anonymous relation can be created ', function() {
            var idResourceA = 0;

            before(function(done) {
                corbelDriver.resources.collection(COLLECTION_A).add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    idResourceA = id;
                })
                .should.be.eventually.fulfilled.notify(done);
            });

            after(function(done) {
                corbelDriver.resources.resource(COLLECTION_A, idResourceA)
                .delete()
                .should.be.eventually.fulfilled.notify(done);
            });

            it('returning CREATED (201)', function(done) {
                var jsonRelationData = {
                    stringField: 'testCreateRelation'
                };
                var jsonRelationData2 = {
                    stringField: 'testCreateRelation2'
                };

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
                    expect(response.data[0].stringField).to.be.equal('testCreateRelation');
                    expect(response.data[0]._order).to.be.equal(1);
                    expect(response.data[1].stringField).to.be.equal('testCreateRelation2');
                    expect(response.data[1]._order).to.be.equal(2);
                })
                .should.be.eventually.fulfilled.notify(done);
            });
        });


        describe('When it is requested to create an anonymous relation with a non existent resource id', function() {
            it('fails returning BAD REQUEST (400)', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', RELATION_NAME)
                .add()
                .should.be.eventually.rejected.then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'bad_request');
                    expect(e.data).to.have.property('errorDescription', 'Resource URI not present');
                })
                .should.be.eventually.fulfilled.notify(done);
            });
        });
    });
});
