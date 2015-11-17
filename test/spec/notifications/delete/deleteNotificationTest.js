describe('In NOTIFICATIONS module', function() {

    describe('when testing deletion', function() {
        var corbelDriver;
        var notificationId;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        beforeEach(function(done) {
            corbelTest.common.notifications.createNotification(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function(id) {
                notificationId = id;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.notifications.notification(notificationId)
                .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('a notification template can be deleted', function(done) {
            corbelDriver.notifications.notification(notificationId)
                .delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
