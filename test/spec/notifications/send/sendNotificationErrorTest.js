describe('In NOTIFICATIONS module', function() {

    describe('when testing sending', function() {
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        it('an error [422] is returned when trying to send a notification with invalid data', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email',
                properties: {
                    content: 'content',
                    subject: 'title' + Date.now()
                }
            };

            corbelDriver.notifications.notification()
                .sendNotification(notificationData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [422] is returned when trying to send an empty notification', function(done) {

            corbelDriver.notifications.notification()
                .sendNotification({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });
    });
});
