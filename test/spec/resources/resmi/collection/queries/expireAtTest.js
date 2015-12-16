describe('In RESOURCES module', function() {

    describe('In RESMI module, when getting a collection with ttl using "lower than" query language', function() {
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('a document with more than 60 seconds _expireAt does not exist', function(done) {
            var expireAtCollection = 'test:ExpireAt';
            var localTimeOffset = 30000;
            var date = Date.now();

            var testObject = {
                test: 'test',
                _expireAt: date
            };

            var params = {
                query: [{
                    '$lt': {
                        _expireAt: 'ISODate(' + (new Date(date - 60000 - localTimeOffset)).toISOString() + ')'
                    }
                }]
            };

            corbelDriver.resources.collection(expireAtCollection)
                .add(testObject)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.collection(expireAtCollection)
                        .get(params)
                        .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
        });
    });
});
