describe('In IAM module', function() {

    describe('while testing delete me', function() {
        var corbelRootDriver;
        var corbelDriver;
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
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            var random = Date.now();

            corbelRootDriver.iam.users()
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

        it('the logged user deletes himself', function(done) {

            corbelDriver.iam.user()
            .deleteMe()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
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
