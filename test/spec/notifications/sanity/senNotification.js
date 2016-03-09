describe('In NOTIFICATIONS module', function() {

    var silkroadCredentials = corbelTest.CONFIG.clientCredentials.silkroad;
    var recipientEmail = silkroadCredentials.email;
    var password = silkroadCredentials.password;

    var corbelDriver;
    var oauthCommon;
    var authorizationParams;
    var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;

    var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
    var prodOauthClient = prodCredentials.DEFAULT_CLIENT_OAUTH;
    var prodOauthUser = prodCredentials.DEFAULT_USER_OAUTH;

    before(function(done) {
        corbelDriver = corbelTest.getCustomDriver(prodIamUser);
        oauthCommon = corbelTest.common.oauth;
        authorizationParams = oauthCommon.getClientParamsCodeIAM(corbelDriver, prodIamUser, prodOauthClient);

        corbelDriver.oauth.authorization(authorizationParams)
            .login(prodOauthUser.username, prodOauthUser.password)
        .should.be.eventually.fulfilled.and.should.notify(done);
    });

    describe('when request to send a email notification', function() {
        var title = 'title' + Date.now();

        var notificationData = {
            notificationId: 'notification-qa:email',
            recipient: recipientEmail,
            properties: {
                content: 'content',
                subject: title
            }
        };

        it.only('12341234[SANITY] success returning the email to recipient', function(done) {
            corbelDriver.notifications.notification().send(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                var queries = [
                    corbelTest.common.mail.imap.buildQuery('contain', 'subject', title)
                ];
                return corbelTest.common.mail.imap
                    .getMailWithQuery(recipientEmail, password, 'imap.gmail.com', queries)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail.subject).to.be.equal(title);
                expect(mail.text).to.be.equal('content\n');
            })
            .should.notify(done);
        });
    });

});