describe('In OAUTH module', function() {

    describe('when the user changes his password', function() {
        var corbelDriver;
        var oauthCommonUtils;
        var oauthUserTest;
        var clientParams;
        var userEmail;
        var userMail = corbelTest.CONFIG.COMMON.MAIL.email;
        var passwordMail = corbelTest.CONFIG.COMMON.MAIL.password;
        var newPassword;
        var MAX_RETRY = 3;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommonUtils = corbelTest.common.oauth;
            clientParams = oauthCommonUtils.getClientParams();
            oauthUserTest = {
                username: 'randomUser' + Date.now(),
                password: 'randomPassword' + Date.now()
            };

            userEmail = corbelTest.common.mail.imap.getRandomMail();
            oauthUserTest.email = userEmail;

            return corbelDriver.oauth
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
                .should.notify(done);
        });

        after(function(done){
            oauthCommonUtils
                .getToken(corbelDriver, oauthUserTest.username, newPassword)
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

        it('should receive a change password notification email [mail]', function(done) {
            var username = oauthUserTest.username;
            var pass = oauthUserTest.password;
            newPassword = pass + pass;

            oauthCommonUtils
                .getToken(corbelDriver, username, pass)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    var token = response.data['access_token'];
                    expect(token).to.match(oauthCommonUtils.getTokenValidation());

                    return corbelDriver.oauth
                        .user(oauthCommonUtils.getClientParams(), token)
                        .update('me', {
                            password: newPassword
                        })
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var queries = [
                        corbelTest.common.mail.imap.buildQuery('contain', 'delivered', oauthUserTest.email),
                        corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'New password')
                    ];

                    return corbelTest.common.mail.imap
                        .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries)
                        .should.be.eventually.fulfilled;
                })
                .then(function(mail) {
                   expect(mail).to.have.property('subject', 'New password');
                })
                .should.notify(done);
        });
    });
});
