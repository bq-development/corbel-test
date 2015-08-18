describe('In RESOURCES module', function() {

    describe('In RESMI module, testing queries,', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectDeleteQuery' + Date.now(); 
        var amount = 10;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount).
            should.eventually.be.fulfilled.notify(done);
        });

        describe('if we use delete collection without query all elements are deleted,', function() {

            it('successes returning', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            stringSortCut: 'Test Short Cut'
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    response.data.forEach(function(element) {
                        expect(element.stringSortCut).to.be.equal('Test Short Cut');
                    });

                    return corbelDriver.resources.collection(COLLECTION)
                    .delete()
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
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

        describe('if we use delete collection with query' +
               ' all elements corresponding to query are deleted,', function() {

            it('successes returning', function(done) {
                var paramsToDelete = {
                    query: [{
                        '$gt': {
                            intField: 500
                        },
                    }]
                };

                var paramsToCheck = {
                    query: [{
                        '$lt': {
                            intField: 600
                        },
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(paramsToDelete)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    response.data.forEach(function(element) {
                        expect(element.intField).to.be.above(500);
                    });

                    return corbelDriver.resources.collection(COLLECTION)
                    .delete(paramsToDelete)
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(paramsToDelete)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data.length).to.be.equal(0);

                    return corbelDriver.resources.collection(COLLECTION)
                    .get(paramsToCheck)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data.length).to.be.equal(5);
                    response.data.forEach(function(element) {
                        expect(element.intField).to.be.below(600);
                    });
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
