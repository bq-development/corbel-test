describe('In IAM module', function() {
    var corbelDriver;
    var corbelRootDriver;
    var user;

    afterEach(function(done) {
        corbelDriver.iam.user()
        .deleteMe()
        .should.be.eventually.fulfilled
        .should.notify(done);
    });

    describe('while testing close all user sessions', function() {

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });


        it('the logged user sessions are deleted using "me"', function(done) {
            var tokenPreCloseSessions = corbelDriver.config.config.iamToken.accessToken;

            corbelDriver.iam.user('me')
            .closeSessions()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user('me')
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(e) {
                var tokenPostCloseSessions = corbelDriver.config.config.iamToken.accessToken;

                expect(tokenPreCloseSessions).not.to.be.equals(tokenPostCloseSessions);
            })
            .should.notify(done);
        });

        it('the logged user sessions are deleted using closeSessionsMe', function(done) {
            var tokenPreCloseSessions = corbelDriver.config.config.iamToken.accessToken;

            corbelDriver.iam.user()
            .closeSessionsMe()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user('me')
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(e) {
                var tokenPostCloseSessions = corbelDriver.config.config.iamToken.accessToken;

                expect(tokenPreCloseSessions).not.to.be.equals(tokenPostCloseSessions);
            })
            .should.notify(done);
        });
    });

    describe('while testing close all user sessions with an admin user', function() {
        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });

        it('can delete logged user sessions', function(done) {
            corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
            .should.eventually.be.fulfilled
            .then(function() {
                var tokenPreCloseSessions = corbelDriver.config.config.iamToken.accessToken;

                return corbelDriver.iam.user(user.id)
                .closeSessions()
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.iam.user('me')
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(e) {
                    var tokenPostCloseSessions = corbelDriver.config.config.iamToken.accessToken;

                    expect(tokenPreCloseSessions).not.to.be.equals(tokenPostCloseSessions);
                });

            })
            .should.notify(done);
        });
    });
});
