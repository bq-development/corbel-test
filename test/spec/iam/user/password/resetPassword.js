describe('In IAM module', function() {

    describe('while trying reset your password', function() {
        var corbelDriver;
        var user;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(userData) {
                user = userData[0];
            })
            .should.notify(done);
        });

        afterEach(function(done) {

            corbelDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('the request can be done with a non existent email', function(done) {
            corbelDriver.iam.user()
            .sendResetPasswordEmail('nonExistent@nothing.net')
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it.only('when resetPassword is used, a token that allows update the user is received', function(done) {
            var emailAuthorization;

            corbelTest.common.iam.getRandomMail()
            .should.be.eventually.fulfilled
            .then(function(response){
                debugger; // jshint ignore:line
                user.email = response.emailData.email_addr; // jshint ignore:line
                emailAuthorization = response.cookies.PHPSESSID;

                return corbelDriver.iam.user(user.id)
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
                                if (response.length === 0) {
                                    return q.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, 30, 2);
                //var queries = [
                    //corbelTest.common.iam.buildEmailQuery('contain', 'subject', 'Reset'),
                    //corbelTest.common.iam.buildEmailQuery('dateLaterThan', 'date', mailFromDate)
                //];
                //return corbelTest.common.iam.getMailWithQuery
                    //(user.email, 'qa2014silkroad', 'imap.gmail.com', queries)
                //.should.be.eventually.fulfilled;
            })
            .then(function(emails) {
                var email = emails[0];

            })
            .then(function(mail) {
                expect(mail.text.indexOf('Click on the link to reset your password')).to.be.gte(0);
                var oneTimeToken = corbelTest.common.iam.getCodeFromMail(mail);
                // crear driver para actualizar usuario
                return corbelDriver.iam.user()
                .updateMe({
                    password: user.password + user.password
                }, oneTimeToken).should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelTest.common.clients
                    .loginUser(corbelDriver, user.username, user.password)
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');

                return corbelTest.common.clients
                    .loginUser(corbelDriver, user.username, user.password + user.password)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });
    });
});
