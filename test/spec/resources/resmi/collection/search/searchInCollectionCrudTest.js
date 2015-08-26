describe('In RESOURCES module', function() {

    describe('In RESMI module, testing search', function() {
        var corbelDriver;
        var COLLECTION = 'test:searchableCollection';

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });
        
        // this test will run correctly when elastic search works correctly
        it.skip('CRUD in collection update search index and' +
               ' returns elements satisfying the chain of search', function(done) {
            var createdResourceId;
            var random = Date.now();

            corbelDriver.resources.collection(COLLECTION)
            .add({
                field1: 'Test' + random
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                createdResourceId = id;
                var params = {
                    search: 'Test' + random
                };
               
                return corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.property('field1').to.be.equal('Test'+random);
                expect(response).to.have.property('id').to.be.equal(createdResourceId);

                return corbelDriver.resources.resource(COLLECTION, createdResourceId)
                    .update({
                        field1: 'OtherTest' + random,
                    })
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                var params = {
                    search: 'Test' + random
                };

                return corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data[0]).to.have.property('field1').to.be.equal('Test'+random);
                expect(response.data[0]).to.have.property('id').to.be.equal(createdResourceId);

                return corbelDriver.resources.resource(COLLECTION, createdResourceId)
                    .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                var params = {
                    search:  'othertest' + random
                };

                return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data.length).to.be.equal(0);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
