describe('In RESOURCES module', function() {

    describe('In RESMI module, testing create relation', function() {
        var corbelDriver;

        var COLLECTION_A = 'test:createRelationError' + Date.now();
        var COLLECTION_B = 'test:createRelationError-dest' + Date.now();

        var resourceIdA;
        var resourceIdB;

        var TEST_OBJECT = {
            name : 'testObject',
            date : Date.now()
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
                resourceIdB = id;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.collection(COLLECTION_A, resourceIdA)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.collection(COLLECTION_B, resourceIdB)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to add malformed data', function(done){
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
            .add(resourceIdB, 'malformed')
            .should.be.eventually.rejected
            .then(function(e){
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to update a relation with malformed data', function(done){
            var firstRelationObject, finalRelationObject;

            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                .add(resourceIdB)
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                        .get(resourceIdB)
                        .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    firstRelationObject = response.data;

                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                        .add(resourceIdB, 'malformed')
                        .should.be.eventually.rejected;
                })
                .then(function(e){
                    expect(e).to.have.property('status', 422);
                    expect(e).to.have.deep.property('data.error', 'invalid_entity');

                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                        .get(resourceIdB)
                        .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    var finalRelationObject = response.data;

                    expect(firstRelationObject).to.be.deep.equal(finalRelationObject);
                })
                .should.notify(done);
        });

        it('an error [400] is returned while trying to relate non-existent collections', function(done){
            corbelDriver.resources.relation('test:notExists', resourceIdA, COLLECTION_B)
            .add(resourceIdB)
            .should.be.eventually.rejected
            .then(function(e){
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'bad_request');
            })
            .should.notify(done);
        });

        it('an error [400] is returned while trying to create a relation with non-existent resource', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', COLLECTION_B)
            .add(resourceIdB)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'bad_request');
            })
            .should.notify(done);
        });

        it('an error [400] is returned while trying to create a relation without relationId', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
            .add(null)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'bad_request');
            })
            .should.notify(done);
        });

        it('400 is returned creating a relation with non-existent resource and no relationId', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, 'notExistingId', COLLECTION_B)
            .add(null)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'bad_request');
            })
            .should.notify(done);
        });
    });
});
