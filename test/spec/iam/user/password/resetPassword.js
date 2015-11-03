describe('In IAM module', function() {

    describe('while trying reset your password', function() {
        var corbelDriver;
        var user;
        var mailFromDate;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();

            corbelTest.common.iam.getActualDateEmail(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function(date) {
                mailFromDate = date;

                return corbelTest.common.iam.createUsers(corbelDriver, 1)
                .should.be.eventually.fulfilled;
            })
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
            corbelDriver.iam.users()
            .sendResetPasswordEmail(user.email)
            .should.be.eventually.fulfilled
            .then(function() {
                var queries = [
                    corbelTest.common.iam.buildEmailQuery('contain', 'subject', 'Reset'),
                    corbelTest.common.iam.buildEmailQuery('dateLaterThan', 'date', mailFromDate)
                ];
                return corbelTest.common.iam.getMailWithQuery
                    (user.email, 'qa2014silkroad', 'imap.gmail.com', queries)
                .should.be.eventually.fulfilled;
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
            .then(function() {
                return corbelTest.common.clients
                    .loginUser(corbelDriver, user.username, user.password + user.password)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });
    });
});
