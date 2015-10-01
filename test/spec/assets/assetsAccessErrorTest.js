describe('In ASSETS module', function() {
    describe('when a client asks for assets without authorization', function(){

        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('request is rejected due to authorization reasons', function(done) {
            corbelDriver.assets().access()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
            })
            .should.notify(done);
        });
    });
});
