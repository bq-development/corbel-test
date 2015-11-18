describe('In IAM module', function() {

    describe('while trying reset your password', function() {
        var corbelDriver;
        var corbelRootDriver;
        var user;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(userData) {
                user = userData[0];
            })
            .should.notify(done);
        });

        afterEach(function(done) {

            corbelRootDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('the request can be done with a non existent email', function(done) {
            corbelDriver.iam.users()
            .sendResetPasswordEmail('nonExistent@nothing.net')
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when resetPassword is used, a token that allows update the user is received', function(done) {
            var emailAuthorization;
            var oneTimeToken;
            var corbelResetDriver;

            corbelTest.common.iam.getRandomMail()
            .should.be.eventually.fulfilled
            .then(function(response){
                user.email = response.emailData.email_addr; // jshint ignore:line
                emailAuthorization = response.cookies.PHPSESSID;

                return corbelRootDriver.iam.user(user.id)
                .update({email: user.email})
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.iam.users()
                .sendResetPasswordEmail(user.email)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelTest.common.utils.retry(function() {
                        return corbelTest.common.iam.checkMail(emailAuthorization)
                            .then(function(response) {
                                if (response.emailList.list.length === 0) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, 30, 2)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                emailAuthorization = response.cookies.PHPSESSID;
                var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                return corbelTest.common.iam.getMail(emailAuthorization, emailId)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('mail_body')
                    .and.to.contain('Click on the link to reset your password');
                oneTimeToken = corbelTest.common.iam.getCodeFromMail(mail);

                corbelResetDriver = corbel.getDriver({
                    iamToken: { 
                        accessToken: ''
                    },
                    domain: corbelTest.CONFIG.DOMAIN,
                    urlBase: corbelTest.CONFIG.COMMON.urlBase
                });


                return corbelResetDriver.iam.user('me')
                .update({
                    password: user.password + user.password
                })
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'invalid_token');

                corbelResetDriver = corbel.getDriver({
                    iamToken: { 
                        accessToken: oneTimeToken
                    },
                    domain: corbelTest.CONFIG.DOMAIN,
                    urlBase: corbelTest.CONFIG.COMMON.urlBase
                });

                return corbelResetDriver.iam.user('me')
                .update({
                    password: user.password + user.password
                })
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelTest.common.clients
                    .loginUser(corbelDriver, user.username, user.password)
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                //expect(e).to.have.deep.property('data.error', 'invalid_entity');

                return corbelTest.common.clients
                    .loginUser(corbelDriver, user.username, user.password + user.password)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('when resetPassword is used, a token is received but only can be used one time', function(done) {
            var emailAuthorization;
            var oneTimeToken;
            var corbelResetDriver;

            corbelTest.common.iam.getRandomMail()
            .should.be.eventually.fulfilled
            .then(function(response){
                user.email = response.emailData.email_addr; // jshint ignore:line
                emailAuthorization = response.cookies.PHPSESSID;

                return corbelRootDriver.iam.user(user.id)
                .update({email: user.email})
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.iam.users()
                .sendResetPasswordEmail(user.email)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelTest.common.utils.retry(function() {
                        return corbelTest.common.iam.checkMail(emailAuthorization)
                            .then(function(response) {
                                if (response.emailList.list.length === 0) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, 30, 2)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                emailAuthorization = response.cookies.PHPSESSID;
                var emailId = response.emailList.list[0].mail_id; //jshint ignore:line

                return corbelTest.common.iam.getMail(emailAuthorization, emailId)
                .should.be.eventually.fulfilled;
            })
            .then(function(mail) {
                expect(mail).to.have.property('mail_body')
                    .and.to.contain('Click on the link to reset your password');
                oneTimeToken = corbelTest.common.iam.getCodeFromMail(mail);

                corbelResetDriver = corbel.getDriver({
                    iamToken: { 
                        accessToken: oneTimeToken
                    },
                    domain: corbelTest.CONFIG.DOMAIN,
                    urlBase: corbelTest.CONFIG.COMMON.urlBase
                });

                return corbelResetDriver.iam.user('me')
                .update({
                    password: user.password + user.password
                })
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelResetDriver.iam.user('me')
                .update({
                    password: user.password
                })
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'invalid_token');

                return corbelTest.common.clients
                    .loginUser(corbelDriver, user.username, user.password + user.password)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });
    });
});
