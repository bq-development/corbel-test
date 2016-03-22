describe('In ASSETS module', function() {

    describe('when a client asks for assets/access', function(){
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('request is rejected due to only user can upgrade token', function(done) {
            corbelDriver.assets.asset().access()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });
    });

});
