describe('In IAM module, when get a token with/out client side authentication', function() {

    var corbelDriver;

    var aud = 'http://iam.bqws.io';
    var testPrn = 'silkroad-qa@bqreaders.com';
    var clientSecret = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']).clientSecret;
    var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
    var jwtAlgorithm = 'HS256';
    var clientIdrequestDomainClient = 'be246f55';
    var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
    var claimExp = _.cloneDeep(corbelTest.CONFIG['claimExp']);

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });


    it(' with not allowed client, it fails returning error UNAUTHORIZED(401)', function(done) {
        var claims = {
            iss: clientIdrequestDomainClient,
            prn: testPrn,
            aud: aud,
            scope: claimDefault.scopes,
            version: version
        };
        claims.exp = Math.round((new Date().getTime() / 1000)) + claimExp;
        corbelDriver.iam
            .token()
            .create({
                jwt: corbel.jwt.generate(
                    claims,
                    clientSecret,
                    jwtAlgorithm
                )
            })
            .should.be.eventually.rejected
            .then(function(e) {
                var error = e.data;
                expect(e.status).to.be.equal(401);
                expect(error.error).to.be.equal('unauthorized');
            })
            .should.be.eventually.fulfilled.and.notify(done);
    });

    it('without prn and with not allowed client, it successes returning an access token', function(done) {
        var claims = {
            iss: claimDefault.clientId,
            aud: aud,
            scope: claimDefault.scopes,
            version: version
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
            .should.be.eventually.fulfilled.and.notify(done);
    });
});
