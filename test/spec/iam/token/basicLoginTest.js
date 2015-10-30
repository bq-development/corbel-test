describe('In IAM module', function() {

    var corbelDriver;
    var userId;
    var corbelDriverAdmin;
    var random = Date.now();
    var domainEmail = '@funkifake.com';
    var user = {
        'firstName': 'createUserIam',
        'email': 'createUserIam.iam.' + random + domainEmail,
        'username': 'createUserIam.iam.' + random + domainEmail,
        'password': 'myPassword'
    };

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        corbelDriverAdmin = corbelTest.drivers['ADMIN_CLIENT'].clone();
    });

    after(function(done) {
        corbelDriverAdmin.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriverAdmin.iam.user(userId)
                    .get()
                    .should.be.eventually.rejected;
            })
            .then(function(e) {
                var error = e.data;
                expect(e).to.have.property('status', 404);
                expect(error).to.have.deep.property('error', 'not_found');
            })
            .should.notify(done);
    });

    it('a new user can be created and logged with basic login', function(done) {

        corbelDriverAdmin.iam.users()
            .create(user)
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;
                return corbelTest.common.clients
                    .loginUser(corbelDriver, user.email, user.password)
                    .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriverAdmin.iam.user(userId)
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(createdUser) {
                expect(createdUser).to.have.deep.property('data.firstName', user.firstName);
                expect(createdUser).to.have.deep.property('data.email', user.email.toLowerCase());
                expect(createdUser).to.have.deep.property('data.username', user.username);
                expect(createdUser).not.to.contain.keys('password', 'salt');
            }).
        should.notify(done);
    });
});
