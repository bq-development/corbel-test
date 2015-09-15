describe('In CORBELJS module', function() {
    var corbelDriver;

    before(function() {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    describe('Response request', function() {

        var COLLECTION_UNAUTHORIZED = 'unauthorized:CorbelJSTestResponseFail' + Date.now();

        var TEST_OBJECT = {
            name : 'testObject',
            date : Date.now()
        };

        it('Rejects the creation of the collection and the response is an object', function(done){
            corbelDriver.resources.collection(COLLECTION_UNAUTHORIZED)
                .add(TEST_OBJECT)
                .should.be.rejected
                .then(function(response){
                    expect(response).to.be.an('object');
                    expect(response).to.include.keys(
                        'data',
                        'status'
                    );
                    expect(response.status).to.equals(401);
                    expect(response.data).to.include.keys(
                        'error',
                        'errorDescription'
                    );
                })
                .should.notify(done);
        });
    });
});
