describe('In NOTIFICATIONS module', function() {

    describe('when testing crud operations', function() {
        var corbelDriver;
        var notificationId;
        var notificationData = {
            id: 'mail_notification_' + Date.now(),
            type: 'mail',
            sender: 'me',
            text: 'text',
            title: 'subject'
        };

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        it('a notification template can be created, updated and deleted', function(done) {
            corbelDriver.notifications.notification()
                .create(notificationData)
            .should.be.eventually.fulfilled
            .then(function(id) {
                notificationId = id;

                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.property('data').and.to.contain(notificationData);

                return corbelDriver.notifications.notification(notificationId)
                    .update({type: 'sms'})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.type', 'sms');

                return corbelDriver.notifications.notification(notificationId)
                    .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
