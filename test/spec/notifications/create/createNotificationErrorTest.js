describe('In NOTIFICATIONS module', function() {

    describe.only('when testing creation', function() {
        var corbelDriver;
        var unauthorizedDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            unauthorizedDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        });

        it('an error is returned while trying to create a notification template without permission', function(done) {
            var notificationData = {
                id: 'mail_notification_' + Date.now(),
                type: 'mail',
                sender: 'me',
                text: 'text',
                title: 'subject'
            };

            unauthorizedDriver.notifications.notification()
                .create(notificationData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to create an invalid notification template', function(done) {

            corbelDriver.notifications.notification()
                .create({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });
    });
});
