describe('In NOTIFICATIONS module', function() {

    describe('while getting notification domain', function() {
        var unauthorizedDriver;

        before(function() {
            unauthorizedDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        });

        it('an error is returned while trying to get a notification domain without permission', function(done) {

            unauthorizedDriver.notifications.domain()
                .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });
    });
});
