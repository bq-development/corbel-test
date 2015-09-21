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

        it('a registry in the relation is created and updated', function(done){
            corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
            .add(idResourceB, {
                myextrafield : 'test'
            })
            .should.be.fulfilled
            .then(function(response){
                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                    .get(idResourceB);
            })
            .should.be.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.myextrafield', 'test');
            })
            .then(function(){
                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .add(idResourceB, {
                    myextrafield : 'updatedField'
                })
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                    .get(idResourceB);
            })
            .should.be.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.myextrafield', 'updatedField');
            })
            .should.notify(done);
        });
    });
});
