describe('In IAM module, testing add identity', function() {
    var corbelDriver;
    var userId;
    var random;
    var userIdNotExist = Date.now();
    var domainEmail = '@funkifake.com';
    before(function() {
        corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
    });

    beforeEach(function(done) {
        random = Date.now();
        var user = {
            'firstName': 'add.identity-' + random,
            'email': 'add.identity.' + random + domainEmail,
            'username': 'add.identity.' + random + domainEmail,
            'scopes': ['iam:user:create', 'resources:music:read_catalog', 'resources:music:streaming']
        };
        corbelDriver.iam.user().create(user)
        .should.be.eventually.fulfilled
        .then(function(id) {
            userId = id;
        })
        .should.notify(done);
    });



    afterEach(function(done) {
        corbelDriver.iam.user(userId).delete()
        .should.be.eventually.fulfilled
        .and.notify(done);
    });

    describe('Add a new social identity to an existing user', function() {

        describe('create a user to add identity', function() {

            describe('When add a facebook identity to the user ', function() {
                it('successes returning created', function(done) {
                    corbelDriver.iam.user(userId).addIdentity({
                        'oauthService': 'facebook',
                        'oauthId': random
                    })
                    .should.be.eventually.fulfilled.and.notify(done);
                });
            });

            describe('Even request the same facebook identity for user with different oauthId', function() {
                it('successes returning created', function(done) {
                    corbelDriver.iam.user(userId).addIdentity({
                        'oauthService': 'facebook',
                        'oauthId': random + '1123'
                    })
                    .should.be.eventually.fulfilled
                    .and.to.be.ok
                    .and.notify(done);
                });
            });

            describe('When request a silkroad identity for user ', function() {
                it('successes returning created', function(done) {
                    corbelDriver.iam.user(userId).addIdentity({
                        'oauthService': 'silkroad',
                        'oauthId': random
                    })
                    .should.be.eventually.fulfilled
                    .should.notify(done);

                });
            });

            describe('When request an identity already exists', function() {
                it('fails returning the identity already exists', function(done) {
                    var userId2;
                    corbelDriver.iam.user(userId).addIdentity({
                        'oauthService': 'facebook',
                        'oauthId': random
                    })
                    .should.be.eventually.fulfilled
                    .then(function() {
                        //create a new user
                        var random2 = Date.now();
                        var addIdentityUser2 = {
                            'firstName': 'add.identity2-',
                            'email': 'add.identity2.',
                            'username': 'add.identity2.',
                            'scopes': ['iam:user:create', 'resources:music:read_catalog', 'resources:music:streaming']
                        };
                        var user2 = {
                            'firstName': addIdentityUser2.firstName + random2,
                            'email': addIdentityUser2.email + random2 + domainEmail,
                            'username': addIdentityUser2.username + random2 + domainEmail,
                            'scopes': addIdentityUser2.scopes
                        };
                        return corbelDriver.iam.user().create(user2)
                        .should.be.eventually.fulfilled;
                    })
                    .then(function(id) {
                        userId2 = id;
                        var identity = {
                            'oauthService': 'facebook',
                            'oauthId': random
                        };
                        return corbelDriver.iam.user(id).addIdentity(identity)
                        .should.be.eventually.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 409);
                        expect(e).to.have.deep.property('data.error', 'identity_exists');
                        return corbelDriver.iam.user(userId2).delete()
                        .should.be.eventually.fulfilled;
                    })
                    .should.notify(done);
                });
            });

            describe('When request an identity of the same oauth server', function() {
                it('fails returning the identity already exists', function(done) {
                    corbelDriver.iam.user(userId).addIdentity({
                        'oauthService': 'facebook',
                        'oauthId': random
                    })
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelDriver.iam.user(userId).addIdentity({
                            'oauthService': 'facebook',
                            'oauthId': Date.now()
                        })
                        .should.be.eventually.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 409);
                        expect(e).to.have.deep.property('data.error', 'oauth_service_duplicated');
                    })
                    .should.notify(done);
                });
            });

            describe('When request an identity and User id not found in IAM', function() {
                it('fails returning User id not found in IAM', function(done) {
                    corbelDriver.iam.user(userIdNotExist).addIdentity({
                        'oauthService': 'facebook',
                        'oauthId': random
                    })
                    .should.be.eventually.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 404);
                        expect(e).to.have.deep.property('data.error', 'not_found');
                    })
                    .should.notify(done);
                });
            });

            describe('When request an invalid specified oauth service ior not allowed in the domain', function() {
                it('fails returning invalid oauth service error', function(done) {
                    corbelDriver.iam.user(userId).addIdentity({
                        'oauthService': 'VK',
                        'oauthId': random
                    })
                    .should.be.eventually.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e).to.have.deep.property('data.error', 'invalid_oauth_service');
                    })
                    .should.notify(done);

                });
            });
        });
    });
});
