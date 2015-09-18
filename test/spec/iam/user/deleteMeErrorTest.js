describe('In IAM module', function() {

    describe('while testing delete me', function() {
        var corbelDriver;
        var corbelDefaultDriver;
        var userId;
        var random;
        var emailDomain = '@funkifake.com';
        var deleteUserMe = {
            'firstName': 'userDeleteMe',
            'lastName': 'userDeleteMe',
            'email': 'user.deleteMe',
            'username': 'user.deleteMe',
            'password': 'passDeleteMe'
        };

        before(function() {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            var random = Date.now();

            corbelDriver.iam.user()
            .create({
                'firstName': deleteUserMe.firstName,
                'lastName': deleteUserMe.lastName,
                'email': deleteUserMe.email + random + emailDomain,
                'username': deleteUserMe.username + random + emailDomain,
                'password': deleteUserMe.password,
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;

                return corbelTest.common.clients.loginUser
                    (corbelDriver, deleteUserMe.username + random + emailDomain, deleteUserMe.password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });

        it('an error is returned while trying to get user with the same driver after use deleteMe', function(done) {

            corbelDriver.iam.user()
            .deleteMe()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e){
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to use deleteMe with another logged driver', function(done) {
            corbelDefaultDriver.iam.user()
            .deleteMe()
            .should.be.eventually.rejected
            .then(function(e){
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });
    });
});
