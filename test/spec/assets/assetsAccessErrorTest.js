describe('In ASSETS module', function() {
    describe('when client with no GET/assets scopes asks for assets', function(){
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('request is rejected due to authorization reasons', function(done) {
            corbelDriver.assets().access()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });
    });
});
