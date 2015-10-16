describe('In RESOURCES module', function() {

    describe('In RESMI module, ', function() {
        var corbelDriver;
        var COLLECTION_A = 'test:CorbelJSTestRelation' + Date.now();
        var COLLECTION_B = 'test:CorbelJSTestRelation-dest' + Date.now();

        var idResourceA;
        var idResourceB;

        var TEST_OBJECT = {
            name : 'testObject',
            date : Date.now()
        };

        var EXTRA_DATA = {
            myextrafield : 'test',
            secondField : 'second'
        };

        describe('when testing relation creation ', function() {
            beforeEach(function(done) {
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
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                    .delete()
                    .should.eventually.be.fulfilled;
                }).
                should.notify(done);
            });

            it('a relation with no extra fields can be created', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .add(idResourceB)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                        .get(idResourceB)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);           
            });

            it('a relation with extra fields can be created', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .add(idResourceB)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                        .get(idResourceB)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);           
            });

            it('a relation with no extra fields can be created and updated', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .add(idResourceB)
                .should.be.eventually.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                        .get(idResourceB)
                        .should.be.eventually.fulfilled;
                })
                .should.be.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.id', COLLECTION_B+'/'+idResourceB);
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                    .add(idResourceB, EXTRA_DATA)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                        .get(idResourceB)
                        .should.be.eventually.fulfilled;
                })
                .should.be.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.myextrafield', 'test');
                    expect(response).to.have.deep.property('data.secondField', 'second');
                })
                .should.notify(done);
            });

            it('a relation with extra fields can be created and updated', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .add(idResourceB, EXTRA_DATA)
                .should.be.fulfilled
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                        .get(idResourceB)
                        .should.be.eventually.fulfilled;
                })
                .should.be.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.myextrafield', 'test');
                    expect(response).to.have.deep.property('data.secondField', 'second');
                })
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                    .add(idResourceB, {
                        myextrafield : 'updatedField',
                        thirdField : 'third'
                    })
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                        .get(idResourceB)
                        .should.be.eventually.fulfilled;
                })
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.myextrafield', 'updatedField');
                    expect(response).to.have.deep.property('data.secondField', 'second');
                    expect(response).to.have.deep.property('data.thirdField', 'third');

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                    .add(idResourceB, {
                        myextrafield : null
                    })
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                        .get(idResourceB)
                        .should.be.eventually.fulfilled;
                })
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).not.to.have.deep.property('data.myextrafield');
                    expect(response).to.have.deep.property('data.secondField', 'second');
                    expect(response).to.have.deep.property('data.thirdField', 'third');
                })
                .should.notify(done);
            });
        });
    });
});
