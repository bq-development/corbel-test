describe('In OAUTH module', function() {

    describe('common reset password tests', function() {
        var getCodeFromMail = corbelTest.common.mail.imap.getCodeFromMail;

        var corbelDriver;
        var oauthCommonUtils;
        var userTestParams;
        var oauthUserTest = {
            username: 'randomUser' + Date.now(),
            password: 'randomPassword' + Date.now()
        };
        var clientParams;
        var MAX_RETRY = 3;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommonUtils = corbelTest.common.oauth;
            userTestParams = oauthCommonUtils.getOauthUserTestParams();
        });

        after(function(done){
            oauthCommonUtils
                .getToken(corbelDriver, oauthUserTest.username, oauthUserTest.password +
                            oauthUserTest.password)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    var token = response.data['access_token'];
                    return corbelDriver.oauth
                        .user(clientParams, token)
                        .delete('me')
                        .should.be.eventually.be.fulfilled;
                })
                .should.notify(done);
        });

        it('reset password of an nonexistent user never fails', function(done) {
            var clientParams = {
                clientId: userTestParams.clientId,
                clientSecret: userTestParams.clientSecret
            };
            var email = 'randomEmail_' + Date.now() + '@nothing.net';

            corbelDriver.oauth
                .user(clientParams)
                .sendResetPasswordEmail(email)
                .should.be.eventually.fulfilled
                .should.notify(done);
        });


        it('email allows reset user account password with client sending once time token to change it [mail]',
            function(done) {

            var oneTimeToken;
            clientParams = oauthCommonUtils.getClientParams();
            var userMail = corbelTest.CONFIG.clientCredentials.silkroad.email;
            var passwordMail = corbelTest.CONFIG.clientCredentials.silkroad.password;

            oauthUserTest.email = corbelTest.common.mail.imap.getRandomMail();
            
            corbelDriver.oauth
                .user(clientParams)
                .create(oauthUserTest)
                .should.be.eventually.fulfilled
                .then(function() {
                    var queries = [
                        corbelTest.common.mail.imap.buildQuery('contain', 'delivered', oauthUserTest.email),
                        corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'Validate your account email')
                    ];

                    return corbelTest.common.mail.imap
                        .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                        .should.be.eventually.fulfilled;
                })
                .then(function(mail) {
                    expect(mail).to.have.property('subject', 'Validate your account email');
                })
                .then(function() {
                    return corbelDriver.oauth
                        .user(clientParams)
                        .sendResetPasswordEmail(encodeURIComponent(oauthUserTest.email))
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var queries = [
                        corbelTest.common.mail.imap.buildQuery('contain', 'delivered', oauthUserTest.email),
                        corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'Reset your account password')
                    ];

                    return corbelTest.common.mail.imap
                        .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                        .should.be.eventually.fulfilled;
                })
                .then(function(email) {
                    expect(email).to.have.property('subject', 'Reset your account password');
                    oneTimeToken = getCodeFromMail(email);

                    return corbelDriver.oauth
                        .user(oauthCommonUtils.getClientParams(), oneTimeToken)
                        .update('me', {
                            password: oauthUserTest.password + oauthUserTest.password
                        })
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.oauth
                        .user(oauthCommonUtils.getClientParams(), oneTimeToken)
                        .update('me', {
                            password: oauthUserTest.password + oauthUserTest.password +
                                oauthUserTest.password
                        })
                        .should.be.eventually.rejected;
                })
                .then(function() {
                    return oauthCommonUtils
                        .getToken(corbelDriver, oauthUserTest.username, oauthUserTest.password +
                            oauthUserTest.password)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});
