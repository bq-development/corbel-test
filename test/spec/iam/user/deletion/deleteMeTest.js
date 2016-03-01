describe('In IAM module', function() {

    describe('while testing delete me', function() {
        var corbelRootDriver;
        var corbelDriver;
        var user;

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        beforeEach(function(done) {

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser
                    (corbelDriver, user.username, user.password)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('the logged user deletes himself', function(done) {

            corbelDriver.iam.user()
            .deleteMe()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e){
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
