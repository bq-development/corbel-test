describe('In IAM module, testing  errors in add identity', function() {
    var corbelDriver;
    var userId;
    var random;
    var userIdNotExist = Date.now();
    var domainEmail = '@funkifake.com';
    var userId2;

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
        corbelDriver.iam.users()
        .create(user)
        .should.be.eventually.fulfilled
        .then(function(id) {
            userId = id;
        })
        .should.notify(done);
    });

    afterEach(function(done) {
        corbelDriver.iam.user(userId).delete()
        .should.be.eventually.fulfilled
        .then(function(){
            return corbelDriver.iam.user(userId)
            .get()
            .should.be.eventually.rejected;
        })
        .then(function(e) {
            expect(e).to.have.property('status', 404);
            expect(e).to.have.deep.property('data.error', 'not_found');
        })
        .should.notify(done);
    });

    after(function(done) {
        corbelDriver.iam.user(userId2).delete()
        .should.be.eventually.fulfilled
        .then(function(){
            return corbelDriver.iam.user(userId2)
            .get()
            .should.be.eventually.rejected;
        })
        .then(function(e) {
            expect(e).to.have.property('status', 404);
            expect(e).to.have.deep.property('data.error', 'not_found');
        })
        .should.notify(done);
    });

    describe('adding a new social identity to an existing user', function() {
        it('should fail [409] returning an identity that already exists', function(done) {
            corbelDriver.iam.user(userId).addIdentity({
                'oauthService': 'facebook',
                'oauthId': random
            })
            .should.be.eventually.fulfilled
            .then(function() {
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
                return corbelDriver.iam.users().create(user2)
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

        it('an error [409] is returned while trying to create an identity with the same oauth server', function(done) {
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

        it('an error [404] is returned while requesting an identity and User id not found in IAM', function(done) {
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

        it('an error [400] is returned while requesting an invalid oauth service', function(done) {
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
