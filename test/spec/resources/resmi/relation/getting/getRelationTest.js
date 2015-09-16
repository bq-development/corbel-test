describe('In RESOURCES module', function() {

    describe('In RESMI module, testing get relation', function() {
        var corbelDriver;
        
        describe('When request to retrieve elements of a resources relation,', function() {
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
                }).
                should.eventually.be.fulfilled.notify(done);
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
                .should.be.eventually.fulfilled.notify(done);
            });

            it('if try to get all of them, successes returning the list of elements', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .get(null)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data).to.have.length(2);
                    expect(response.data[0]).to.have.property('stringField', jsonRelationData.stringField);
                    expect(response.data[1]).to.have.property('stringField', jsonRelationData.stringField);
                })
                .should.be.eventually.fulfilled.notify(done);
            });

            it('if try to get one of them, successes returning the element', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .get(idResourceB)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.stringField).to.be.equal(jsonRelationData.stringField);
                })
                .should.be.eventually.fulfilled.notify(done);
            });


            it('if the relation not exist, successes returning the list of elements empty', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', COLLECTION_B)
                .get(null)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data).to.have.property('length').to.be.equal(0);
                })
                .should.be.eventually.fulfilled.notify(done);
            });
        });
    });
});
