describe('In OAUTH module', function() {

    describe('when the user changes his password', function() {
        var popEmail = corbelTest.common.mail.mailInterface.popEmail;

        var corbelDriver;
        var oauthCommonUtils;
        var oauthUserTest;
        var clientParams;
        var userEmail;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommonUtils = corbelTest.common.oauth;
            clientParams = oauthCommonUtils.getClientParams();
            oauthUserTest = {
                username: 'randomUser' + Date.now(),
                password: 'randomPassword' + Date.now()
            };

            return corbelTest.common.mail
                .mailInterface.getRandomMail()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    userEmail = response;
                    oauthUserTest.email = response;

                    return corbelDriver.oauth
                        .user(clientParams)
                        .create(oauthUserTest)
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return popEmail(userEmail)
                        .should.be.eventually.fulfilled;
                })
                .then(function(mail) {
                   expect(mail).to.have.property('subject', 'Validate your account email');
                })
                .should.notify(done);
        });

        it('should receive a change password notification email [mail]', function(done) {
            var username = oauthUserTest.username;
            var password = oauthUserTest.password;

            oauthCommonUtils
                .getToken(corbelDriver, username, password)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    var token = response.data['access_token'];
                    expect(token).to.match(oauthCommonUtils.getTokenValidation());

                    return corbelDriver.oauth
                        .user(oauthCommonUtils.getClientParams(), token)
                        .update('me', {
                            password: password + password
                        })
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return popEmail(userEmail)
                        .should.be.eventually.fulfilled;
                })
                .then(function(mail) {
                   expect(mail).to.have.property('subject', 'New password');
                })
                .should.notify(done);
        });
    });
});
