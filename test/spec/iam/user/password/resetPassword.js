describe('In IAM module', function() {

    describe('You can reset your password', function() {
        var corbelDriver;
        var user;
        var mailFromDate;
        var iamUser;

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
                user = userData;
            }).catch(function(error){
              console.dir(error);
            })
            .should.notify(done);
        });

        afterEach(function(done) {

            corbelDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('and never fails with an inexistent email', function(done) {
            corbelDriver.iam.user()
            .sendResetPasswordEmail('nonExistent@nothing.net')
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when you use resetPassword endpoint, receive token ', function() {
            it.only('that allows update user', function(done) {
                corbelDriver.iam.user()
                .sendResetPasswordEmail(iamUser.email)
                .should.be.eventually.fulfilled
                .then(function() {
                    var queries = [
                        corbelTest.common.iam.buildQuery('contain', 'subject', 'Reset'),
                        corbelTest.common.iam.buildQuery('dateLaterThan', 'date', mailFromDate)
                    ];
                    return corbelTest.common.iam.getMailWithQuery
                        (iamUser.email, 'qa2014silkroad', 'imap.gmail.com', queries)
                    .should.be.eventually.fulfilled;
                })
                .then(function(mail) {
                    expect(mail.text.indexOf('Click on the link to reset your password')).to.be.gte(0);
                    var oneTimeToken = corbelTest.common.iam.getCodeFromMail(mail);
                    return corbelDriver.iam.user()
                    .updateMe({
                        password: iamUser.password + iamUser.password
                    }, oneTimeToken).should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.iam.login({
                        'username': iamUser.username,
                        'password': iamUser.password,
                        'remember': false
                    }).should.eventually.be.rejected;
                })
                .then(function() {
                    return corbelTest.common.iam.login({
                        'username': iamUser.username,
                        'password': iamUser.password + iamUser.password,
                        'remember': false
                    })
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });
        });
    });
});
