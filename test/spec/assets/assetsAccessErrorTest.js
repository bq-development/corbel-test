describe('In ASSETS module', function() {
    var corbelDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    it('when a client asks for assets/access without authorization,' +
        ' fails returning unauthorized(401)',
        function(done) {
            corbelDriver.assets().access()
                .should.eventually.be.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                })
                .should.notify(done);
        });
});
