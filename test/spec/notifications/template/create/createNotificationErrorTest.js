describe('In NOTIFICATIONS module', function() {

    describe('when testing template creation', function() {
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

            unauthorizedDriver.notifications.template()
                .create(notificationData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to create an empty template', function(done) {

            corbelDriver.notifications.template()
                .create({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to create a template without sender', function(done) {
            var notificationData = {
                id: 'mail_notification_' + Date.now(),
                type: 'mail',
                text: 'text',
                title: 'subject'
            };

            corbelDriver.notifications.template()
                .create(notificationData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to create a template without type', function(done) {
            var notificationData = {
                id: 'mail_notification_' + Date.now(),
                sender: 'me',
                text: 'text',
                title: 'subject'
            };

            corbelDriver.notifications.template()
                .create(notificationData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to create a template without text', function(done) {
            var notificationData = {
                id: 'mail_notification_' + Date.now(),
                sender: 'me',
                type: 'mail',
                title: 'subject'
            };

            corbelDriver.notifications.template()
                .create(notificationData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });
    });
});
