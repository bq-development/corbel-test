describe('In IAM module', function() {

    var corbelAdminDriver;
    var corbelNewDriver;
    var userData;

    before(function(done) {

        corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(user) {
                userData = user[0];
            })
            .should.notify(done);
    });

    after(function(done) {
        corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        corbelAdminDriver.iam.user(userData.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.iam.user(userData.id)
                    .get()
                    .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
    });

    it('a user is logged with basic login', function(done) {

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
            'prn': userData.email
        };

        corbelNewDriver = corbel.getDriver({
            domain: corbelTest.CONFIG.DOMAIN,
            urlBase: corbelTest.CONFIG.COMMON.urlBase
        });

        corbelNewDriver.iam
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


                return corbelNewDriver.iam.user('me')
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(createdUser) {
                expect(createdUser).to.have.deep.property('data.firstName', userData.firstName);
                expect(createdUser).to.have.deep.property('data.email', userData.email.toLowerCase());
                expect(createdUser).to.have.deep.property('data.username', userData.username);
                expect(createdUser).not.to.contain.keys('password', 'salt');
            })
            .should.notify(done);
    });
});
