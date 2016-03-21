describe('In NOTIFICATIONS module', function() {

    describe('when testing sending', function() {
        var popEmail = corbelTest.common.mail.maildrop.popEmail;
        var corbelDriver;
        var title = 'title' + Date.now();

        var notifications = [{
            test: 'the notification is sended correctly [mail]',
            id: 'notification-qa:email',
            properties: {
                content: 'content',
                subject: title
            },
            expect: function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('content').and.to.contain('content');
            }
        }, {
            test: 'the notification contains a complex string and is sended correctly [mail]',
            id: 'notification-qa:email',
            properties: {
                content: 'ñÑçáéíóúàèìòùâêîôû',
                subject: title
            },
            expect: function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('content').and.to.contain('ñÑçáéíóúàèìòùâêîôû');
            }
        }, {
            test: 'the notification does not contains properties and is sended correctly [mail]',
            id: 'notification-qa:email',
            properties: undefined,
            expect: function(mail) {
                expect(mail).to.have.property('subject', '{{subject}}');
                expect(mail).to.have.property('content').and.to.contain('{{{content}}}');
            }
        }, {
            test: 'the notification contains html data and is sended correctly [mail]',
            id: 'notification-qa:email:html',
            properties: {
                username: 'Corbel',
                subject: title
            },
            expect: function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('content').and.to.contain('Bienvenido Corbel :)');
            }
        }, {
            test: 'the notification contains html data and is sended correctly [mail]',
            id: 'notification-qa:email:html',
            properties: {
                username: 'ñÑçáéíóúàèìòùâêîôû',
                subject: title
            },
            expect: function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('content').and.to.contain('Bienvenido ñÑçáéíóúàèìòùâêîôû :)');
            }
        }];

        function sendNotifications(email, notifications) {
            var promises = notifications.map(function(notification, index) {
                notification.email = index + email;

                var notificationData = {
                    notificationId: notification.id,
                    recipient: notification.email,
                    properties: notification.properties
                };
                return corbelDriver.notifications.notification()
                    .send(notificationData);
            });

            return Promise.all(promises);
        }

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();

            corbelTest.common.mail.maildrop.getRandomMail()
                .should.be.eventually.fulfilled
                .then(function(email) {

                    return sendNotifications(email, notifications)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        notifications.forEach(function(notification) {
            it(notification.test, function(done) {
                popEmail(notification.email)
                    .should.be.eventually.fulfilled
                    .then(notification.expect)
                    .should.notify(done);
            });
        });

    });
});
