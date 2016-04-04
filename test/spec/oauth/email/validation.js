describe('In OAUTH module', function() {

    describe('notifications tests', function() {
        var getCodeFromMail = corbelTest.common.mail.imap.getCodeFromMail;
        var corbelDriver;
        var oauthCommonUtils;
        var clientParams;
        var oauthUserTest;
        var userMail = corbelTest.CONFIG.COMMON.MAIL.email;
        var passwordMail = corbelTest.CONFIG.COMMON.MAIL.password;
        var MAX_RETRY = 3;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommonUtils = corbelTest.common.oauth;
            clientParams = oauthCommonUtils.getClientParams();
        });

        beforeEach(function(done) {
            oauthUserTest = {
                username: 'randomUser' + Date.now(),
                password: 'randomPassword' + Date.now()
            };

            oauthUserTest.email = corbelTest.common.mail.imap.getRandomMail();

            corbelDriver.oauth
                .user(clientParams)
                .create(oauthUserTest)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        afterEach(function(done) {
            oauthCommonUtils
                .getToken(corbelDriver, oauthUserTest.username, oauthUserTest.password)
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

        it('email allows validate user account and has two endpoint that validate user account with email code [mail]',
            function(done) {
                var username = oauthUserTest.username;
                var passwordOauth = oauthUserTest.password;
                var emailAddress = oauthUserTest.email;
                var queries = [
                    corbelTest.common.mail.imap.buildQuery('contain', 'delivered', emailAddress),
                    corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'Validate your account email')
                ];

                corbelTest.common.mail.imap
                    .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                    .should.be.eventually.fulfilled
                    .then(function(email) {
                        expect(email).to.have.property('subject', 'Validate your account email');
                        var code = getCodeFromMail(email);

                        return corbelDriver.oauth
                            .user(clientParams, code)
                            .emailConfirmation('me')
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return oauthCommonUtils
                            .getToken(corbelDriver, username, passwordOauth, true)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response.data['access_token']).to.match(oauthCommonUtils.getTokenValidation());
                    })
                    .should.notify(done);
            });

        it('email allows validate user account and has two endpoint that resend validation email [mail]',
            function(done) {
                var username = oauthUserTest.username;
                var passwordOauth = oauthUserTest.password;
                var emailAddress = oauthUserTest.email;
                var queries = [
                    corbelTest.common.mail.imap.buildQuery('contain', 'delivered', emailAddress),
                    corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'Validate your account email')
                ];

                corbelTest.common.mail.imap
                    .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                    .should.be.eventually.fulfilled
                    .then(function(email) {
                        expect(email).to.have.property('subject', 'Validate your account email');
                        var code = getCodeFromMail(email);

                        return corbelDriver.oauth
                            .user(clientParams, code)
                            .sendValidateEmail('me')
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return corbelTest.common.mail.imap
                            .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(email) {
                        expect(email).to.have.property('subject', 'Validate your account email');
                        var code = getCodeFromMail(email);

                        return corbelDriver.oauth
                            .user(clientParams, code)
                            .emailConfirmation('me')
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return oauthCommonUtils
                            .getToken(corbelDriver, username, passwordOauth, true)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response.data['access_token']).to.match(oauthCommonUtils.getTokenValidation());
                    })
                    .should.notify(done);
            });
    });
});
