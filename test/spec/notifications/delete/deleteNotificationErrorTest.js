describe('In NOTIFICATIONS module', function() {

    describe('when testing deletion', function() {
        var unauthorizedDriver;

        before(function() {
            unauthorizedDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        });

        it('an error is returned while trying to delete a notification template without permission', function(done) {

            unauthorizedDriver.notifications.notification('id')
                .delete()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });
    });
});
