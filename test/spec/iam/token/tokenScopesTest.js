describe('In IAM module', function() {

    var corbelDriver;
    var claimAdmin = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT']);
    var claimDefaultClient = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
    var tokenValidation = /^.+\..+\..+$/;
    var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
    var aud = 'http://iam.bqws.io';
    var jwtAlgorithm = 'HS256';
    var requestDomain = 'silkroad-qa';
    var testPrn = 'silkroad-qa@bqreaders.com';
    var userData;
    var corbelAdminDriver;

    before(function(done) {
        corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        corbelDriver = corbelTest.getCustomDriver({
            domain: corbelTest.CONFIG.DOMAIN
        });

        corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(user) {
                userData = user[0];
            })
            .should.be.eventually.fulfilled
            .should.notify(done);
    });

    after(function(done) {
        corbelAdminDriver.iam.user(userData.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.iam.user(userData.id)
                    .get()
                    .should.be.eventually.rejected;
            })
            .then(function(response) {
                expect(response).to.have.property('status', 404);
                expect(response).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
    });

    describe('When request an access token', function(){

        function createClaims(params){
            var claims = {
                'iss': params.iss || claimAdmin.clientId,
                'request_domain': params.request_domain || requestDomain,  // jshint ignore:line
                'aud': params.aud || aud,
                'version': params.version || version,
                'scope': params.scope || claimAdmin.scopes,
                'prn': params.prn || testPrn
            };
            return claims;
        }

        it('an access token and expiration time is returned when using a scopes from clients scopes', function(done) {

            var claims = createClaims({'scope': 'iam:user:create'});

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.accessToken');
                    expect(response.data.accessToken).to.match(tokenValidation);
                    expect(response).to.have.deep.property('data.expiresAt', claims.exp * 1000);
                })
                .should.notify(done);
        });

        it('an access token and expiration time is returned when using a scopes from client ' +
            'and a scope from user scopes', function(done) {

            var claims = createClaims({'scope': 'iam:user:create resources:music:read_catalog'});

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.accessToken');
                    expect(response.data.accessToken).to.match(tokenValidation);
                    expect(response).to.have.deep.property('data.expiresAt', claims.exp * 1000);
                })
                .should.notify(done);
        });

        it('an access token and expiration time is returned when using a scope from user scopes', function(done) {

            var claims = createClaims({'scope': 'resources:music:read_catalog'});

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.accessToken');
                    expect(response.data.accessToken).to.match(tokenValidation);
                    expect(response).to.have.deep.property('data.expiresAt', claims.exp * 1000);
                })
                .should.notify(done);
        });

        it('an unauthorized error is returned when using a scope is not a client scope', function(done) {

            var claims = createClaims({'scope': 'silkroad-qa:test:domain_only resources:music:read_catalog ' +
            'resources:music:edit_playlist iam:comp:admin resources:music:streaming'});

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an unauthorized error is returned when using  a scope from user NOT a scope from client', function(done) {

            var claims = createClaims({'scope': 'iam:comp:admin', 'iss': claimDefaultClient.clientId});

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an unauthorized error is returned when using a scope not in client neither user scopes', function(done) {

            var claims = createClaims({'scope': 'http://resources.bqws.io.READ'});

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an unauthorized error is returned using a scope not in client neither user scopes ' +
            'but scope exists in the domain', function(done) {

            var claims = createClaims({'scope': 'resource:music:streaming','prn': 'silkroad-qa-empty@bqreaders.com'});

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
              .should.notify(done);
        });
    });
});

