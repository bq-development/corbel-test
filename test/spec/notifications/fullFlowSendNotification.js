describe('In NOTIFICATIONS module', function() {

    describe('when testing full flow: create domain, create notification template and send notification', function() {
        var corbelRootDriver;
        var testDriver;
        var notificationId;
        var notificationDomainData;
        var notificationTemplateData;
        var notificationData;
        var domainIdCreated;
        var timestamp;
        var userMail = corbelTest.CONFIG.clientCredentials.silkroad.email;
        var passwordMail = corbelTest.CONFIG.clientCredentials.silkroad.password;
        var email;
        var MAX_RETRY = 7;

        before(function(done) {
            timestamp = Date.now();
            var clientScopes = ['notifications:admin'];
            var domainId = 'domain-fullFlowTest-' + timestamp;
            domainIdCreated = 'silkroad-qa:' + domainId;
            var clientName = 'client-crudDomainTest-' + timestamp;
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

                email = corbelTest.common.mail.imap.getRandomMail();

                notificationData = {
                    notificationId: 'tempKey',
                    recipient: email,
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
            .then(function() {
                var corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();

                return testDriver.notifications.notification()
                .send(notificationData)
                .should.be.eventually.fulfilled;
            })
            .then(function() {

                 var queries = [
                    corbelTest.common.mail.imap.buildQuery('contain', 'delivered', email),
                    corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'title-' + domainIdCreated)
                ];

                return corbelTest.common.mail.imap
                    .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                    .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('subject', 'title-' + domainIdCreated);
                expect(mail).to.have.property('text');
            })
            .should.notify(done);
        });

    });
});
