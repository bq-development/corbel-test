describe('In OAUTH module', function () {

    describe('when the user changes his password', function () {
        var MAX_RETRY = 28;
        var RETRY_PERIOD = 3;

        var corbelDriver;
        var oauthCommonUtils;
        var oauthUserTest;
        var clientParams;
        var userEmailData;

        before(function (done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommonUtils = corbelTest.common.oauth;
            clientParams = oauthCommonUtils.getClientParams();
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

        it('should receive a change password notification email', function (done) {
            var username = oauthUserTest.username;
            var password = oauthUserTest.password;

            oauthCommonUtils
                .getToken(corbelDriver, username, password)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    var token = response.data['access_token'];
                    expect(token).to.match(oauthCommonUtils.getTokenValidation());

                    return corbelDriver.oauth
                        .user(oauthCommonUtils.getClientParams(), token)
                        .update('me', {password: password + password})
                        .should.be.eventually.fulfilled;
                })
                .then(function () {
                    return corbelTest.common.utils.retry(function () {
                        return corbelTest.common.mail.random.checkMail(userEmailData.cookies.PHPSESSID)
                            .then(function (response) {
                                if (response.emailList.list.length === 0) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                        .should.be.eventually.fulfilled;
                })
                .then(function (response) {
                    //var mailSubject = 'mail_subject';
                    var subjects = [];

                    response.emailList.list.forEach(function (email) {
                        subjects.push(email['mail_subject'].toLowerCase());
                    });
                    expect(subjects).to.include('new password');

                    //TODO: usar despues
                    //response.emailList.list.should.contain.an.item.with.property('mail_subject', 'New Password');
                })
                .should.notify(done);
        });
    });
});
