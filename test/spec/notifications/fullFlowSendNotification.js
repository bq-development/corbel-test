describe('In NOTIFICATIONS module', function() {

    describe('when testing full flow: create domain, create notification template and send notification', function() {
        var corbelRootDriver;
        var testDriver;
        var notificationId;
        var notificationDomainData;
        var notificationTemplateData;
        var notificationData;
        var domainIdCreated;
        var emailRecipient;
        var emailAuthorization;

        var MAX_RETRY = 28;
        var RETRY_PERIOD = 3;


        before(function(done) {
            var clientScopes = ['notifications:admin'];
            var domainId = 'domain-fullFlowTest-' + Date.now();
            domainIdCreated = 'silkroad-qa:' + domainId;
            var clientName = 'client-crudDomainTest-' + Date.now();
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();

            notificationDomainData = {};
            notificationDomainData['properties'] = {
                title: 'title-' + domainIdCreated
            };
            notificationDomainData['templates'] = {};
            notificationDomainData['templates'][domainIdCreated + ':tempKey'] = domainIdCreated + ':tempValue';

            notificationTemplateData = {
                id: 'tempValue',
                type: 'email',
                sender: 'fullflownotification@bq.com',
                text: 'text',
                title: '{{{title}}}'
            };

            corbelTest.common.iam.createDomainAndClient(corbelRootDriver, domainId, clientName, clientScopes)
            .then(function(clientInfo) {
                testDriver = corbelTest.getCustomDriver({
                    'clientId': clientInfo.id,
                    'clientSecret': clientInfo.key,
                    'scopes': clientScopes.join(' ')
                });


                return corbelTest.common.mail.mailinterface.getRandomMail()
                    .should.be.eventually.fulfilled;
            })
            .then(function(response){
                emailRecipient = response;

                notificationData = {
                    notificationId: 'tempKey',
                    recipient: emailRecipient,
                    properties: {
                    }
                };
            })
            .should.notify(done);
        });

        it('it works correctly [mail]', function(done) {
            testDriver.notifications.domain().create(notificationDomainData)
            .should.be.eventually.fulfilled
            .then(function() {
                return testDriver.notifications.template()
                .create(notificationTemplateData)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                var corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();

                return testDriver.notifications.notification()
                .send(notificationData)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelTest.common.utils.retry(function() {
                        return corbelTest.common.mail.mailinterface.checkMail(emailRecipient)
                            .then(function(response) {
                                if (response.length === 0) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                return corbelTest.common.mail.mailinterface.getMail(emailRecipient, response[0].id)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('subject', 'title-' + domainIdCreated);
                expect(mail.body).to.contain('text');
            })
            .should.notify(done);
        });

    });
});
