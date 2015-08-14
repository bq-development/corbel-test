describe.only('In RESOURCES module', function() {
    var corbelDriver;

    before(function() {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    describe('In RESMI module, relations', function() {

        var COLLECTION_A = 'test:CorbelJSTestRelation' + Date.now();
        var COLLECTION_B = 'test:CorbelJSTestRelation-dest' + Date.now();

        var idResourceA, idResourceB;

        var TEST_OBJECT = {
            name : 'testObject',
            date : Date.now()
        };

        before(function(done) {
            //Create resources
            corbelDriver.resources.collection(COLLECTION_A).add(TEST_OBJECT).
            should.eventually.be.fulfilled.
            then(function(id) {
                idResourceA = id;
                return corbelDriver.resources.collection(COLLECTION_B).add(TEST_OBJECT).
                should.eventually.be.fulfilled;
            }).
            then(function(id) {
                idResourceB = id;
            }).
            should.notify(done);
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
                expect(response.data).to.include.keys('myextrafield');
                expect(response.data.myextrafield).to.equals('test');
                done();
            })
            .catch(function(err){
                console.log(err);
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
                expect(response.data).to.include.keys('myextrafield', 'newfield');
                expect(response.data.myextrafield).to.equals('test');
                expect(response.data.newfield).to.equals('testnewField');
                done();
            })
            .catch(function(err){
                console.log(err);
            })
            .should.notify(done);


        });
        

    });
});
