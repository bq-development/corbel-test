describe('In NOTIFICATIONS module', function() {

    describe('when testing sending', function() {
        var corbelDriver;
        var corbelRootDriver;
        var user;
        var emailAuthorization;
        var title;
        var MAX_RETRY = 28;
        var RETRY_PERIOD = 3;


        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
            title = 'title' + Date.now();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(userData) {
                user = userData[0];

                return corbelTest.common.mail.getRandomMail()
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                user.email = response.emailData.email_addr; // jshint ignore:line
                emailAuthorization = response.cookies.PHPSESSID;

                return corbelRootDriver.iam.user(user.id)
                .update({email: user.email})
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        afterEach(function(done) {

            corbelRootDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('the notification is sended correctly', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email',
                recipient: user.email,
                properties: {
                    content: 'content',
                    subject: title
                }
            };

            corbelDriver.notifications.notification()
                .sendNotification(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelTest.common.utils.retry(function() {
                        return corbelTest.common.mail.checkMail(emailAuthorization)
                            .then(function(response) {
                                if (response.emailList.list.length === 0) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                emailAuthorization = response.cookies.PHPSESSID;
                var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                return corbelTest.common.mail.getMail(emailAuthorization, emailId)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', title);
                expect(mail).to.have.property('mail_body', 'content');
            })
            .should.notify(done);
        });

        it('the notification contains a complex string and is sended correctly', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email',
                recipient: user.email,
                properties: {
                    content: 'ñÑçáéíóúàèìòùâêîôû',
                    subject: title
                }
            };

            corbelDriver.notifications.notification()
                .sendNotification(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelTest.common.utils.retry(function() {
                        return corbelTest.common.mail.checkMail(emailAuthorization)
                            .then(function(response) {
                                if (response.emailList.list.length === 0) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                emailAuthorization = response.cookies.PHPSESSID;
                var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                return corbelTest.common.mail.getMail(emailAuthorization, emailId)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', title);
                expect(mail).to.have.property('mail_body', 'ñÑçáéíóúàèìòùâêîôû');
            })
            .should.notify(done);
        });

        it('the notification does not contains properties and is sended correctly', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email',
                recipient: user.email
            };

            corbelDriver.notifications.notification()
                .sendNotification(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelTest.common.utils.retry(function() {
                        return corbelTest.common.mail.checkMail(emailAuthorization)
                            .then(function(response) {
                                if (response.emailList.list.length === 0) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                emailAuthorization = response.cookies.PHPSESSID;
                var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                return corbelTest.common.mail.getMail(emailAuthorization, emailId)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', '{{subject}}');
                expect(mail).to.have.property('mail_body', '{{{content}}}');
            })
            .should.notify(done);
        });

        it('the notification contains html data and is sended correctly', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email:html',
                recipient: user.email,
                properties: {
                    username: 'Corbel',
                    subject: title
                }
            };

            corbelDriver.notifications.notification()
                .sendNotification(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelTest.common.utils.retry(function() {
                        return corbelTest.common.mail.checkMail(emailAuthorization)
                            .then(function(response) {
                                if (response.emailList.list.length === 0) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                emailAuthorization = response.cookies.PHPSESSID;
                var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                return corbelTest.common.mail.getMail(emailAuthorization, emailId)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', title);
                expect(mail).to.have.property('mail_body').and.to.contain('Bienvenido Corbel :)');
            })
            .should.notify(done);
        });

        it('the notification contains html data with a complex string and is sended correctly', function(done) {
            var notificationData = {
                notificationId: 'notification-qa:email:html',
                recipient: user.email,
                properties: {
                    username: 'ñÑçáéíóúàèìòùâêîôû',
                    subject: title
                }
            };

            corbelDriver.notifications.notification()
                .sendNotification(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelTest.common.utils.retry(function() {
                        return corbelTest.common.mail.checkMail(emailAuthorization)
                            .then(function(response) {
                                if (response.emailList.list.length === 0) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                emailAuthorization = response.cookies.PHPSESSID;
                var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                return corbelTest.common.mail.getMail(emailAuthorization, emailId)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', title);
                expect(mail).to.have.property('mail_body').and.to.contain('Bienvenido ñÑçáéíóúàèìòùâêîôû :)');
            })
            .should.notify(done);
        });
    });
});
