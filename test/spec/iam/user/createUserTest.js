describe('In IAM module', function() {

    describe('while testing create user', function() {
        var corbelDriver;
        var userId;
        var random;
        var domainEmail = '@funkifake.com';

        var userCreated = {
            'firstName': 'createUserIam',
            'email': 'createUserIam.iam.',
            'username': 'createUserIam.iam.',
            'scopes': ['iam:user:create', 'resources:music:read_catalog']
        };

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        afterEach(function(done) {
            corbelDriver.iam.user(userId)
            .delete()
            .should.eventually.be.fulfilled.and.notify(done);
        });

        it('basic user is created', function(done) {
            random = Date.now();
            var user = {
                'firstName': userCreated.firstName,
                'email': userCreated.email + random + domainEmail,
                'username': userCreated.username + random + domainEmail,
                'scopes': userCreated.scopes
            };

            corbelDriver.iam.user()
            .create(user)
            .should.eventually.be.fulfilled
            .then(function(id) {
                userId = id;
            })
            .should.notify(done);
        });

        it('user with silkroad identity is created', function(done) {
            random = Date.now();
            var user = {
                'firstName': userCreated.firstName,
                'email': userCreated.email + random + domainEmail,
                'username': userCreated.username + random + domainEmail,
                'scopes': userCreated.scopes,
                'identity': {
                    'oauthService': 'silkroad',
                    'oauthId': random
                }
            };

            corbelDriver.iam.user()
            .create(user)
            .should.eventually.be.fulfilled
            .then(function(id) {
                userId = id;
            }).
            should.notify(done);
        });

        it('user with facebook identity is created', function(done) {
            var random = Date.now();
            var user = {
                'firstName': userCreated.firstName,
                'email': userCreated.email + random + domainEmail,
                'username': userCreated.username + random + domainEmail,
                'scopes': userCreated.scopes,
                'identity': {
                    'oauthService': 'facebook',
                    'oauthId': random
                }
            };

            corbelDriver.iam.user()
            .create(user)
            .should.eventually.be.fulfilled
            .then(function(id) {
                userId = id;
            })
            .should.notify(done);
        });

        it('user with google identity is created', function(done) {
            var random = Date.now();
            var user = {
                'firstName': userCreated.firstName,
                'email': userCreated.email + random + domainEmail,
                'username': userCreated.username + random + domainEmail,
                'scopes': userCreated.scopes,
                'identity': {
                    'oauthService': 'google',
                    'oauthId': random
                }
            };

            corbelDriver.iam.user()
            .create(user)
            .should.eventually.be.fulfilled
            .then(function(id) {
                userId = id;
            })
            .should.notify(done);
        });
    });
});
