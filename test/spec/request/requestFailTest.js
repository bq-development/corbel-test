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

    describe('while making requests between servers in different domains (CORS) ', function() {

        /*
         * This test fails in PhantomJS. It returns 404 response status from the OPTIONS
         * request instead of 0. This is a missbehaviour because it should return the
         * status response from the GET, POST, PUT request, not from OPTIONS
        **/
        if (window.chrome) {

            it('0 is returned while requesting something to an url that does not exist', function(done){
                corbelDriver.resources.collection('COLLECTION')
                .get()
                .should.be.eventually.rejected
                .then(function(e){
                    expect(e).to.have.property('status', 0);
                })
                .should.notify(done);
            });
        } else {
           it.skip('there is a problem executing these test with phantom ', function() {});
        }
    });
});
