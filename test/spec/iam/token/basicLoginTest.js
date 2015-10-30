describe('In IAM module', function() {

    // var corbeDefaultlDriver;
    var userId;
    var corbelAdminDriver;
    var corbelNewDriver;
    var random = Date.now();
    var domainEmail = '@funkifake.com';
    var user = {
        'firstName': 'createUserIam',
        'email': 'createUserIam.iam.' + random + domainEmail,
        'username': 'createUserIam.iam.' + random + domainEmail,
        'password': 'myPassword'
    };


    before(function(done) {
        // corbeDefaultlDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        corbelAdminDriver.iam.users()
            .create(user)
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;
            })
            .should.notify(done);
    });

    after(function(done) {
        corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        corbelAdminDriver.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.iam.user(userId)
                    .get()
                    .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
    });

    it('a user logged with basic login', function(done) {

        var claimAdmin = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT']);
        var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
        var aud = 'http://iam.bqws.io';
        var jwtAlgorithm = 'HS256';
        var requestDomain = 'silkroad-qa';
        var claims = {
            'iss': claimAdmin.clientId,
            'request_domain': requestDomain,
            'aud': aud,
            'scope': 'iam:user:me',
            'version': version,
            'prn': user.email
        };

        corbelAdminDriver.iam
            .token()
            .create({
                jwt: corbel.jwt.generate(
                    claims,
                    claimAdmin.clientSecret,
                    jwtAlgorithm
                )
            })
            .should.be.eventually.fulfilled
            .then(function(response) {

                corbelNewDriver = corbel.getDriver({
                    iamToken: {
                        accessToken: response.data.accessToken
                    },
                    domain: corbelTest.CONFIG.DOMAIN,
                    urlBase: corbelTest.CONFIG.COMMON.urlBase
                });
                return corbelNewDriver.iam.user('me')
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
