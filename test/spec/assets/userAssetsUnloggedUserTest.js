describe('In ASSETS module', function() {
    describe('when requesting several assets using invalid a claim', function(){
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('request is rejected due to authorization reasons', function(done) {
            corbelDriver.assets().access()
            .should.eventually.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
            })
            .should.notify(done);
        });
    });
});
