describe('In ASSETS module', function() {
    var corbelDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    it('when a client asks for assets without authorization, server replies with an unauthorized code (401)', 
        function(done) {
            corbelDriver.assets().access()
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                })
                .should.notify(done);
        });
});
