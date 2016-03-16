describe('In NOTIFICATIONS module', function() {

    describe('when testing sending', function() {
        var corbelDriver;
        var emailAuthorization;
        var title;
        var email;
        var MAX_RETRY_SEND_MAIL = 2;
        var MAX_RETRY_CHECK_MAIL = 10;
        var RETRY_PERIOD = 5;


        function generateRandomDataMail() {
            title = 'title' + Date.now();

            return corbelTest.common.mail.random.getRandomMail()
            .should.be.eventually.fulfilled
            .then(function(response){
                email = response.emailData.email_addr; // jshint ignore:line
                emailAuthorization = response.cookies.PHPSESSID;
                return Promise.resolve();
            });
   
        }

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        });

        it('the notification is correctly sent', function(done) {
            corbelTest.common.utils.retry(function() {
                return generateRandomDataMail()
                .should.be.eventually.fulfilled
                .then(function() {
                    var notificationData = {
                        notificationId: 'notification-qa:email',
                        recipient: email,
                        properties: {
                            content: 'content',
                            subject: title
                        }
                    };

                    return corbelDriver.notifications.notification()
                    .send(notificationData)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelTest.common.utils.retry(function() {
                                return corbelTest.common.mail.random.checkMail(emailAuthorization)
                                    .then(function(response) {
                                        if (response.emailList.list.length === 0) {
                                            return Promise.reject();
                                        } else {
                                            return response;
                                        }
                                    });
                            }, MAX_RETRY_CHECK_MAIL, RETRY_PERIOD)
                        .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        emailAuthorization = response.cookies.PHPSESSID;
                        var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                        return corbelTest.common.mail.random.getMail(emailAuthorization, emailId)
                        .should.be.eventually.fulfilled;
                    });    
                });
                
            }, MAX_RETRY_SEND_MAIL, RETRY_PERIOD)
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', title);
                expect(mail).to.have.property('mail_body', 'content');
            })
            .should.notify(done);
        });

        it('the notification contains a complex string and is correctly sent', function(done) {
            corbelTest.common.utils.retry(function() {
                return generateRandomDataMail()
                .should.be.eventually.fulfilled
                .then(function() {
                    var notificationData = {
                        notificationId: 'notification-qa:email',
                        recipient: email,
                        properties: {
                            content: 'ñÑçáéíóúàèìòùâêîôû',
                            subject: title
                        }
                    };

                    return corbelDriver.notifications.notification()
                        .send(notificationData)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelTest.common.utils.retry(function() {
                                return corbelTest.common.mail.random.checkMail(emailAuthorization)
                                    .then(function(response) {
                                        if (response.emailList.list.length === 0) {
                                            return Promise.reject();
                                        } else {
                                            return response;
                                        }
                                    });
                            }, MAX_RETRY_CHECK_MAIL, RETRY_PERIOD)
                        .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        emailAuthorization = response.cookies.PHPSESSID;
                        var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                        return corbelTest.common.mail.random.getMail(emailAuthorization, emailId)
                        .should.be.eventually.fulfilled;
                    });
                });
            }, MAX_RETRY_SEND_MAIL, RETRY_PERIOD)
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', title);
                expect(mail).to.have.property('mail_body', 'ñÑçáéíóúàèìòùâêîôû');
            })
            .should.notify(done);
        });

        it('the notification does not contains properties and is correctly sent', function(done) {
            corbelTest.common.utils.retry(function() { 
                return generateRandomDataMail()
                .should.be.eventually.fulfilled
                .then(function() {    
                    var notificationData = {
                        notificationId: 'notification-qa:email',
                        recipient: email
                    };

                    return corbelDriver.notifications.notification()
                        .send(notificationData)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelTest.common.utils.retry(function() {
                                return corbelTest.common.mail.random.checkMail(emailAuthorization)
                                    .then(function(response) {
                                        if (response.emailList.list.length === 0) {
                                            return Promise.reject();
                                        } else {
                                            return response;
                                        }
                                    });
                            }, MAX_RETRY_CHECK_MAIL, RETRY_PERIOD)
                        .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        emailAuthorization = response.cookies.PHPSESSID;
                        var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                        return corbelTest.common.mail.random.getMail(emailAuthorization, emailId)
                        .should.be.eventually.fulfilled;
                    });
                });
            }, MAX_RETRY_SEND_MAIL, RETRY_PERIOD)
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', '{{subject}}');
                expect(mail).to.have.property('mail_body', '{{{content}}}');
            })
            .should.notify(done);
        });

        it('the notification contains html data and is correctly sent', function(done) {
            corbelTest.common.utils.retry(function() { 
                return generateRandomDataMail()
                .should.be.eventually.fulfilled
                .then(function() {    
                    var notificationData = {
                        notificationId: 'notification-qa:email:html',
                        recipient: email,
                        properties: {
                            username: 'Corbel',
                            subject: title
                        }
                    };   

                    return corbelDriver.notifications.notification()
                        .send(notificationData)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelTest.common.utils.retry(function() {
                                return corbelTest.common.mail.random.checkMail(emailAuthorization)
                                    .then(function(response) {
                                        if (response.emailList.list.length === 0) {
                                            return Promise.reject();
                                        } else {
                                            return response;
                                        }
                                    });
                            }, MAX_RETRY_CHECK_MAIL, RETRY_PERIOD)
                        .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        emailAuthorization = response.cookies.PHPSESSID;
                        var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                        return corbelTest.common.mail.random.getMail(emailAuthorization, emailId)
                        .should.be.eventually.fulfilled;
                    });
                });
            }, MAX_RETRY_SEND_MAIL, RETRY_PERIOD)    
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', title);
                expect(mail).to.have.property('mail_body').and.to.contain('Bienvenido Corbel :)');
            })
            .should.notify(done);
        });

        it('the notification contains html data with a complex string and is correctly sent', function(done) {
            corbelTest.common.utils.retry(function() { 
                return generateRandomDataMail()
                .should.be.eventually.fulfilled
                .then(function() { 

                    var notificationData = {
                        notificationId: 'notification-qa:email:html',
                        recipient: email,
                        properties: {
                            username: 'ñÑçáéíóúàèìòùâêîôû',
                            subject: title
                        }
                    };

                    return corbelDriver.notifications.notification()
                        .send(notificationData)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelTest.common.utils.retry(function() {
                                return corbelTest.common.mail.random.checkMail(emailAuthorization)
                                    .then(function(response) {
                                        if (response.emailList.list.length === 0) {
                                            return Promise.reject();
                                        } else {
                                            return response;
                                        }
                                    });
                            }, MAX_RETRY_CHECK_MAIL, RETRY_PERIOD)
                        .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        emailAuthorization = response.cookies.PHPSESSID;
                        var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                        return corbelTest.common.mail.random.getMail(emailAuthorization, emailId)
                        .should.be.eventually.fulfilled;
                    });
                });
            }, MAX_RETRY_SEND_MAIL, RETRY_PERIOD)   
            .then(function(mail) {
                expect(mail).to.have.property('mail_subject', title);
                expect(mail).to.have.property('mail_body').and.to.contain('Bienvenido ñÑçáéíóúàèìòùâêîôû :)');
            })
            .should.notify(done);
        });
    });
});
