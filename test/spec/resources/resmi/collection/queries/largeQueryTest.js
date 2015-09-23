describe('In RESOURCES module', function() {

    describe('In RESMI module, testing collection large queries,', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectQuery' + Date.now();
        var amount = 10;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when get collection using the equals query language', function() {

            it('returns elements satisfying the numeric equality', function(done) {
                var params = {
                    query: [],
                    pagination: {
                        page: 0
                    }
                };

                var query = {
                    '$eq': {
                        intField: 100
                    }
                };

                for(var i=0;i<250;i++){
                  params.query.push(query);
                }

                corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(1);
                        expect(response.data[0].intField).to.be.equal(100);
                    })
                    .should.notify(done);
            });

        });
    });
});
