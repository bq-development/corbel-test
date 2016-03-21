describe('In OAUTH module', function() {


    describe('common reset password tests', function() {
        var popEmail = corbelTest.common.mail.maildrop.popEmail;
        var getCodeFromMail = corbelTest.common.mail.maildrop.getCodeFromMail;

        var corbelDriver;
        var oauthCommonUtils;
        var userTestParams;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommonUtils = corbelTest.common.oauth;
            userTestParams = oauthCommonUtils.getOauthUserTestParams();
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
                var clientParams = oauthCommonUtils.getClientParams();
                var oauthUserTest = {
                    username: 'randomUser' + Date.now(),
                    password: 'randomPassword' + Date.now()
                };

                corbelTest.common.mail
                    .maildrop.getRandomMail()
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        oauthUserTest.email = response;

                        return corbelDriver.oauth
                            .user(clientParams)
                            .create(oauthUserTest)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return popEmail(oauthUserTest.email)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(mail) {
                       expect(mail).to.have.property('subject', 'Validate your account email');
                    })
                    .then(function() {
                        return corbelDriver.oauth
                            .user(clientParams)
                            .sendResetPasswordEmail(oauthUserTest.email)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return popEmail(oauthUserTest.email)
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
