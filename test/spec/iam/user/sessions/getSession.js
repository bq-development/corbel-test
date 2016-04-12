describe('In IAM module', function() {
    var corbelDriver;
    var user;

    describe('while testing get a user sessions', function() {

        before(function(done) {
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

        after(function(done) {
            corbelDriver.iam.user()
            .deleteMe()
            .should.be.eventually.fulfilled
            .should.notify(done);
        });

        it('current session can be retrieved', function(done) {
            function containScope(scopes, scopeExpected) {
                return scopes.some(function(scope) {
                    return scope === scopeExpected;
                });
            }

            var sessionToken = corbelDriver.config.config.iamToken.accessToken;

            corbelDriver.iam.user()
            .getMySession()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.userId', user.id);
                expect(response).to.have.deep.property('data.token', sessionToken);
                expect(response).to.have.deep.property('data.scopes').to.be.an('array');
                expect(containScope(response.data.scopes, 'iam:user:me')).to.be.equal(true);
            })
            .should.notify(done);
        });
    });
});
