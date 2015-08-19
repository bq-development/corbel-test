describe('In corbelDriver.resources module', function() {
    var COLLECTION = 'test:searchableCollection';

    describe('In RESMI module, testing search', function() {
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        describe('CRUD in collection update search index when', function() {
            
            it.skip('successes returning elements satisfying the chain of search', function(done) {
                var createdResourceId;
                var random = Date.now();

                corbelDriver.resources.collection(COLLECTION)
                .add({
                    field1: 'Test' + random
                })
                .should.eventually.be.fulfilled
                .then(function(id) {
                    createdResourceId = id;
                    var params = {
                        search: 'Test' + random
                    };
                   
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('field1').to.be.equal('Test'+random);
                    expect(response).to.have.property('id').to.be.equal(createdResourceId);

                    return corbelDriver.resources.resource(COLLECTION, createdResourceId)
                        .update({
                            field1: 'OtherTest' + random,
                        })
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    var params = {
                        search: 'Test' + random
                    };

                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data[0]).to.have.property('field1').to.be.equal('Test'+random);
                    expect(response.data[0]).to.have.property('id').to.be.equal(createdResourceId);

                    return corbelDriver.resources.resource(COLLECTION, createdResourceId)
                        .delete()
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    var params = {
                        search:  'othertest' + random
                    };

                    return corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data.length).to.be.equal(0);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
