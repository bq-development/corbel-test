describe('In OAUTH module', function () {

    describe('notifications tests', function () {

        var MAX_RETRY = 10;
        var RETRY_PERIOD = 1;

        var corbelDriver;
        var oauthCommonUtils;
        var clientParams;
        var userTestParams;
        var oauthUserTest;
        var userEmailData;

        before(function () {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommonUtils = corbelTest.common.oauth;
            userTestParams = oauthCommonUtils.getOauthUserTestParams();
            clientParams = oauthCommonUtils.getClientParams();
        });

        beforeEach(function (done) {
            oauthUserTest = {
                username: 'randomUser' + Date.now(),
                password: 'randomPassword' + Date.now()
            };

            return corbelTest.common.mail
                .random.getRandomMail()
                .should.be.eventually.fulfilled
                .then(function (response) {
                    userEmailData = response;
                    oauthUserTest.email = userEmailData.emailData['email_addr'];

                    return corbelDriver.oauth
                        .user(clientParams)
                        .create(oauthUserTest)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('email allows validate user account and has two endpoint that validate user account with email code',
            function (done) {
                var username = oauthUserTest.username;
                var password = oauthUserTest.password;
                var email = oauthUserTest.email;

                corbelTest.common.utils.retry(function () {
                        return corbelTest.common.mail.random
                            .checkMail(userEmailData.cookies.PHPSESSID)
                            .then(function (response) {
                                if (response.emailList.list.length !== 1) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function (response) {
                        response.emailList.list.should.contain.an.thing.with
                            .property('mail_subject', 'Validate your account email');

                        var resetPasswordMail = {};
                        response.emailList.list.forEach(function (email) {
                            if (email['mail_subject'].toLowerCase() === 'validate your account email') {
                                resetPasswordMail = email;
                            }
                        });
                        return corbelTest.common.mail.random
                            .getMail(response.cookies.PHPSESSID, resetPasswordMail['mail_id'])
                            .should.be.eventually.fulfilled;
                    })
                    .then(function (response) {
                        var code = response['mail_body'].split('token=')[1];

                        return corbelDriver.oauth
                            .user(clientParams, code)
                            .emailConfirmation('me')
                            .should.be.eventually.fulfilled;
                    })
                    .then(function () {
                        return oauthCommonUtils
                            .getToken(corbelDriver, username, password, true)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function (response) {
                        expect(response.data['access_token']).to.match(oauthCommonUtils.getTokenValidation());
                    })
                    .should.notify(done);
            });

        it('email allows validate user account and has two endpoint that resend validation email',
            function (done) {
                var username = oauthUserTest.username;
                var password = oauthUserTest.password;
                var email = oauthUserTest.email;

                corbelTest.common.utils.retry(function () {
                        return corbelTest.common.mail.random
                            .checkMail(userEmailData.cookies.PHPSESSID)
                            .then(function (response) {
                                if (response.emailList.list.length !== 1) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function (response) {
                        response.emailList.list.should.contain.an.thing.with
                            .property('mail_subject', 'Validate your account email');

                        var resetPasswordMail = {};
                        response.emailList.list.forEach(function (email) {
                            if (email['mail_subject'].toLowerCase() === 'validate your account email') {
                                resetPasswordMail = email;
                            }
                        });

                        return corbelTest.common.mail.random
                            .getMail(response.cookies.PHPSESSID, resetPasswordMail['mail_id'])
                            .should.be.eventually.fulfilled;
                    })
                    .then(function (response) {
                        var code = response['mail_body'].split('token=')[1];

                        return corbelDriver.oauth
                            .user(clientParams, code)
                            .sendValidateEmail('me')
                            .should.be.eventually.fulfilled;
                    })
                    .then(function () {
                        return corbelTest.common.utils.retry(function () {
                            return corbelTest.common.mail.random
                                .checkMail(userEmailData.cookies.PHPSESSID)
                                .then(function (response) {
                                    if (response.emailList.list.length <= 1) {
                                        return Promise.reject();
                                    } else {
                                        return response;
                                    }
                                });
                        }, MAX_RETRY, RETRY_PERIOD)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function (response) {
                        response.emailList.list.should.contain.an.thing.with
                            .property('mail_subject', 'Validate your account email');

                        var resetPasswordMail = response.emailList.list[0];

                        return corbelTest.common.mail.random
                            .getMail(response.cookies.PHPSESSID, resetPasswordMail['mail_id'])
                            .should.be.eventually.fulfilled;
                    })
                    .then(function (response) {
                        var code = response['mail_body'].split('token=')[1];

                        return corbelDriver.oauth
                            .user(clientParams, code)
                            .emailConfirmation('me')
                            .should.be.eventually.fulfilled;
                    })
                    .then(function () {
                        return oauthCommonUtils
                            .getToken(corbelDriver, username, password, true)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function (response) {
                        expect(response.data['access_token']).to.match(oauthCommonUtils.getTokenValidation());
                    })
                    .should.notify(done);
            });
    });
});
