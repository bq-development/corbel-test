describe('In RESOURCES module', function() {

    describe('In RESMI module, testing create relation', function() {
        var corbelDriver;
        var COLLECTION_A = 'test:CorbelJSTestRelation' + Date.now();
        var COLLECTION_B = 'test:CorbelJSTestRelation-dest' + Date.now();

        var idResourceA;
        var idResourceB;

        var TEST_OBJECT = {
            name : 'testObject',
            date : Date.now()
        };

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelDriver.resources.collection(COLLECTION_A)
            .add(TEST_OBJECT).
            should.eventually.be.fulfilled.
            then(function(id) {
                idResourceA = id;

                return corbelDriver.resources.collection(COLLECTION_B)
                    .add(TEST_OBJECT)
                    .should.eventually.be.fulfilled;
            })
            .then(function(id) {
                idResourceB = id;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                    .delete();
            }).
            should.eventually.be.fulfilled.notify(done);
        });

        it('an error [422] is returned while trying to add a malformed data', function(done){
            corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
            .add(idResourceB, 'malformed')
            .should.be.rejected
            .then(function(e){
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });
    });
});
