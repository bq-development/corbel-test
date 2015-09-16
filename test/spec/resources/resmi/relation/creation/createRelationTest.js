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

        before(function(done) {
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

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                    .delete();
            }).
            should.eventually.be.fulfilled.notify(done);
        });

        it('Creates a new registry in the relation', function(done){
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
                expect(response.data).to.have.property('myextrafield').to.be.equals('test');
            })
            .should.notify(done);
        });

        it('Updates an existing registry in the relation', function(done){
            corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
            .add(idResourceB, {
                newfield : 'testnewField'
            })
            .should.be.fulfilled
            .then(function(response){
                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                    .get(idResourceB);
            })
            .should.be.fulfilled
            .then(function(response){
                expect(response.data).to.have.property('myextrafield').to.be.equals('test');
                expect(response.data).to.have.property('newfield').to.be.equals('testnewField');
            })
            .should.notify(done);
        });
    });
});
