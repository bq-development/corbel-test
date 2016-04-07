describe('In NOTIFICATIONS module', function() {

    describe('when testing sending', function() {
        var corbelDriver;
        var title = 'title';
        var userMail = corbelTest.CONFIG.clientCredentials.silkroad.email;
        var passwordMail = corbelTest.CONFIG.clientCredentials.silkroad.password;
        var email;
        var MAX_RETRY = 3;

        var notifications = [{
            query: title,
            test: 'the notification is sended correctly [mail]',
            id: 'notification-qa:email',
            properties: {
                content: 'content',
                subject: title
            },
            expect: function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('text').and.to.contain('content');
            }
        }, {
            query: title,
            test: 'the notification contains a complex string and is sended correctly [mail]',
            id: 'notification-qa:email',
            properties: {
                content: 'ñÑçáéíóúàèìòùâêîôû',
                subject: title
            },
            expect: function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('text').and.to.contain('ñÑçáéíóúàèìòùâêîôû');
            }
        }, {
            query: '{{subject}}',
            test: 'the notification does not contains properties and is sended correctly [mail]',
            id: 'notification-qa:email',
            properties: undefined,
            expect: function(mail) {
                expect(mail).to.have.property('subject', '{{subject}}');
                expect(mail).to.have.property('text').and.to.contain('{{{content}}}');
            }
        }, {
            query: title,
            test: 'the notification contains html data and is sended correctly [mail]',
            id: 'notification-qa:email:html',
            properties: {
                username: 'Corbel',
                subject: title
            },
            expect: function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('text').and.to.contain('Bienvenido Corbel :)');
            }
        }, {
            query: title,
            test: 'the notification contains html data and is sended correctly [mail]',
            id: 'notification-qa:email:html',
            properties: {
                username: 'ñÑçáéíóúàèìòùâêîôû',
                subject: title
            },
            expect: function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('text').and.to.contain('Bienvenido ñÑçáéíóúàèìòùâêîôû :)');
            }
        }];

        function sendNotifications(email, notifications) {
            var promises = notifications.map(function(notification) {
                email = corbelTest.common.mail.imap.getRandomMail();
                notification.email = email;

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

            sendNotifications(email, notifications)
                .should.be.eventually.fulfilled
                .should.notify(done);
        });

        notifications.forEach(function(notification) {
            it(notification.test, function(done) {

                 var queries = [
                    corbelTest.common.mail.imap.buildQuery('contain', 'delivered', notification.email),
                    corbelTest.common.mail.imap.buildQuery('contain', 'subject', notification.query)
                ];

                corbelTest.common.mail.imap
                    .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                    .should.be.eventually.fulfilled
                    .then(notification.expect)
                    .should.notify(done);
            });
        });
    });
});