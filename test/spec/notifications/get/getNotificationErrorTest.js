describe('In NOTIFICATIONS module', function() {

    describe('while getting notification templates', function() {
        var corbelDriver;
        var unauthorizedDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            unauthorizedDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        });

        it('an error is returned while trying to get a notification template without permission', function(done) {

            unauthorizedDriver.notifications.notification()
                .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error [404] is returned while trying to get non existent notification template', function(done) {

            corbelDriver.notifications.notification('non-existent')
                .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
