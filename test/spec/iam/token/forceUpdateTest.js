    describe('In IAM module, when I try to make a token request', function() {

        var corbelDriver;
        var aud = 'http://iam.bqws.io';
        var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
        var claims = {
            iss: claimDefault.clientId,
            aud: aud,
            scope: claimDefault.scopes
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        var UNSUPPORTED_VERSION = '0.0.0';
        var SUPPORTED_VERSION = '1.0.0';
        var FORCE_UPDATE_MESSAGE = 'unsupported_version';
        var FORCE_UPDATE_CODE = 403;

        it('without version, it works', function(done) {
            claims.version = undefined;
            corbelDriver.iam
                .token()
                .create({
                    jwt: corbel.jwt.generate(claims, claimDefault.clientSecret)
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('with unsupported version version, it fails with 403 - "unsupported_version"', function(done) {

            claims.version = UNSUPPORTED_VERSION;

            corbelDriver.iam
                .token()
                .create({
                    jwt: corbel.jwt.generate(claims, claimDefault.clientSecret)
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    var error = e.data;
                    expect(error.error).to.be.equal(FORCE_UPDATE_MESSAGE);
                    expect(e.status).to.be.equal(FORCE_UPDATE_CODE);
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('with compatible version, it works', function(done) {

            claims.version = SUPPORTED_VERSION;

            corbelDriver.iam
                .token()
                .create({
                    jwt: corbel.jwt.generate(claims, claimDefault.clientSecret)
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });
    });
