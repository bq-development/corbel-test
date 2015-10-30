describe('In IAM module', function() {

    var corbelDriver;
    var userId;
    var corbelDriverAdmin;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        corbelDriverAdmin = corbelTest.drivers['ADMIN_CLIENT'].clone();
    });


    after(function(done) {
        corbelDriverAdmin.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled.and.notify(done);
    });

    it('when request to create a new user and login with basic', function(done) {

        var random = Date.now();

        var userCreate = {
            'firstName': 'createUserIam',
            'email': 'createUserIam.iam.',
            'username': 'createUserIam.iam.',
        };
        var domainEmail = '@funkifake.com';
        var user = {
            'firstName': userCreate.firstName,
            'email': userCreate.email + random + domainEmail,
            'username': userCreate.username + random + domainEmail,
            'password': 'myPassword'
        };

        corbelDriverAdmin.iam
            .users()
            .create(user)
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;
                    return corbelTest.common.clients
                    .loginUser(corbelDriver, user.email, user.password)
                    .should.be.eventually.fulfilled;
            }).
        then(function() {
            return corbelDriverAdmin.iam.user(userId)
                .get()
                .should.be.eventually.fulfilled;
        }).
        then(function(createdUser) {
            expect(createdUser).to.have.deep.property('data.firstName', user.firstName);
            expect(createdUser).to.have.deep.property('data.email', user.email.toLowerCase());
            expect(createdUser).to.have.deep.property('data.username',user.username);
            expect(createdUser).not.to.contain.keys('password', 'salt');
        }).
        should.notify(done);
    });
});
