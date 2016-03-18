describe('In NOTIFICATIONS module', function() {

    describe('when testing sending', function() {
        var popEmail = corbelTest.common.mail.maildrop.popEmail;
        var corbelDriver;
        var corbelRootDriver;
        var user;
        var email;
        var title;
        var MAX_RETRY = 28;
        var RETRY_PERIOD = 3;


        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
            title = 'title' + Date.now();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(userData) {
                user = userData[0];

                return corbelTest.common.mail.maildrop.getRandomMail()
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                user.email = response; // jshint ignore:line
                email = response;

                return corbelRootDriver.iam.user(user.id)
                .update({email: user.email})
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelRootDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('the notification is sended correctly [mail]', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email',
                recipient: user.email,
                properties: {
                    content: 'content',
                    subject: title
                }
            };

            corbelDriver.notifications.notification()
                .send(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return popEmail(email)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('content').and.to.contain('content');
            })
            .should.notify(done);
        });

        it('the notification contains a complex string and is sended correctly [mail]', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email',
                recipient: user.email,
                properties: {
                    content: 'ñÑçáéíóúàèìòùâêîôû',
                    subject: title
                }
            };

            corbelDriver.notifications.notification()
                .send(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return popEmail(email)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('content').and.to.contain('ñÑçáéíóúàèìòùâêîôû');
            })
            .should.notify(done);
        });

        it('the notification does not contains properties and is sended correctly [mail]', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email',
                recipient: user.email
            };

            corbelDriver.notifications.notification()
                .send(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return popEmail(email)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('subject', '{{subject}}');
                expect(mail).to.have.property('content').and.to.contain('{{{content}}}');
            })
            .should.notify(done);
        });

        it('the notification contains html data and is sended correctly [mail]', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email:html',
                recipient: user.email,
                properties: {
                    username: 'Corbel',
                    subject: title
                }
            };

            corbelDriver.notifications.notification()
                .send(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return popEmail(email)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('content').and.to.contain('Bienvenido Corbel :)');
            })
            .should.notify(done);
        });

        it('the notification contains html data with a complex string and is sended correctly [mail]', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email:html',
                recipient: user.email,
                properties: {
                    username: 'ñÑçáéíóúàèìòùâêîôû',
                    subject: title
                }
            };

            corbelDriver.notifications.notification()
                .send(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return popEmail(email)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('subject', title);
                expect(mail).to.have.property('content').and.to.contain('Bienvenido ñÑçáéíóúàèìòùâêîôû :)');
            })
            .should.notify(done);
        });
    });
});
