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


    before(function(done) {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        corbelDriverAdmin = corbelTest.drivers['ADMIN_CLIENT'].clone();
        corbelDriverAdmin.iam.users()
            .create(user)
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;
            })
            .should.notify(done);
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
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
    });

    it('a new user can be created and logged with basic login', function(done) {

        var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
        var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
        var aud = 'http://iam.bqws.io';
        var jwtAlgorithm = 'HS256';
        var requestDomain = 'silkroad-qa';
        var claims = {
            'iss': claimDefault.clientId,
            'request_domain': requestDomain,
            'aud': aud,
            'scope': claimDefault.scopes,
            'version': version,
        };

        corbelDriver.iam
            .token()
            .create({
                jwt: corbel.jwt.generate(
                    claims,
                    claimDefault.clientSecret,
                    jwtAlgorithm
                )
            })
            .should.be.eventually.fulfilled
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
            })
            .should.notify(done);
    });
});
