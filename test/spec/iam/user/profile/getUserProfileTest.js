describe('In IAM module', function() {

    describe('while testing get user profile', function() {
        var corbelRootDriver;
        var corbelDriver;
        var userId;
        var random;
        var domainEmail = '@funkifake.com';

        var user = {
            'firstName': 'get.identity',
            'lastName': 'registerUser',
            'email': 'get.profile',
            'username': 'get.profile',
            'password': 'passRegisterUser',
            'phoneNumber': '654654654',
        };

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone(); 
        });

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            random = Date.now();

            corbelDriver.iam.users()
            .create({
            'firstName': user.firstName + random,
            'lastName': user.lastName,
            'email': user.email + random + domainEmail,
            'username': user.username + random,
            'password': user.password,
            'phoneNumber': user.phoneNumber
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;
                return corbelTest.common.clients.loginUser
                    (corbelDriver, user.username + random + domainEmail, user.password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('a user profile is got through id and admin driver', function(done) {

            corbelRootDriver.iam.user(userId)
            .getProfile()
            .then(function(response) {
                expect(response).to.have.deep.property('data.username', user.username + random);
                expect(response).to.have.deep.property('data.firstName', user.firstName + random);
                expect(response).to.have.deep.property('data.lastName', user.lastName);
                expect(response).to.have.deep.property('data.email', user.email + random + domainEmail);
            }).
            should.notify(done);
        });

        it('a user profile is got through "me"', function(done) {

            corbelDriver.iam.user('me')
            .getProfile()
            .then(function(response) {
                expect(response).to.have.deep.property('data.username', user.username + random);
                expect(response).to.have.deep.property('data.firstName', user.firstName + random);
                expect(response).to.have.deep.property('data.lastName', user.lastName);
                expect(response).to.have.deep.property('data.email', user.email + random + domainEmail);
            }).
            should.notify(done);
        });

        it('a user profile is got through user()', function(done) {

            corbelDriver.iam.user()
            .getProfile()
            .then(function(response) {
                expect(response).to.have.deep.property('data.username', user.username + random);
                expect(response).to.have.deep.property('data.firstName', user.firstName + random);
                expect(response).to.have.deep.property('data.lastName', user.lastName);
                expect(response).to.have.deep.property('data.email', user.email + random + domainEmail);
            }).
            should.notify(done);
        });

        it('all users profile are got through default driver', function(done) {

            var user2Id;
            random = Date.now();

            corbelDriver.iam.users()
            .create({
                'firstName': user.firstName + random,
                'lastName': user.lastName,
                'email': user.email + random + domainEmail,
                'username': user.username + random,
                'password': user.password,
                'phoneNumber': user.phoneNumber
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                user2Id = id;

                return corbelDriver.iam.users()
                .getProfiles()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.length').and.be.above(1);
            })
            .then(function() {
                return corbelRootDriver.iam.user(user2Id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.user(user2Id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
        it('all users profile are got through admin driver', function(done) {

            var user2Id;
            random = Date.now();

            corbelDriver.iam.users()
            .create({
                'firstName': user.firstName + random,
                'lastName': user.lastName,
                'email': user.email + random + domainEmail,
                'username': user.username + random,
                'password': user.password,
                'phoneNumber': user.phoneNumber
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                user2Id = id;

                return corbelRootDriver.iam.users()
                .getProfiles()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.length').and.be.above(1);
            })
            .then(function() {
                return corbelRootDriver.iam.user(user2Id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.user(user2Id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('a user profile is got through admin driver and a query using equal', function(done) {
            var params = {
                query: [{
                    '$eq': {
                        'firstName': user.firstName + random
                    }
                }]
            };

            corbelRootDriver.iam.users()
            .getProfiles(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.length', 1);
            })
            .should.notify(done);
        });

        it('a user is got through admin driver and a query using equal (user does not exists)', function(done) {
            var params = {
                query: [{
                    '$eq': {
                        'firstName': 'unexistent'
                    }
                }]
            };

            corbelRootDriver.iam.users()
            .getProfiles(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('a user is got through admin driver and a query using like', function(done) {
            var params = {
                query: [{
                    '$like': {
                        'firstName': user.firstName
                    }
                }]
            };

            corbelRootDriver.iam.users()
            .getProfiles(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.length').and.to.be.above(0);
            })
            .should.notify(done);
        });

        it('users are got especifying page and pageSize', function(done) {
            var users;
            var params = {
                pagination: {
                    page: 2,
                    pageSize: 5
                }
            };

            corbelTest.common.iam.createUsers(corbelDriver, 10)
            .should.be.eventually.fulfilled
            .then(function(response){
                users = response;
                return corbelRootDriver.iam.users()
                .getProfiles(params)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.length', 5);
            })
            .then(function() {
                var promises = []; 
                users.forEach(function(currentUser){
                     promises.push(corbelRootDriver.iam.user(currentUser.id)
                    .delete()
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelRootDriver.iam.user(currentUser.id)
                        .get()
                        .should.be.eventually.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 404);
                        expect(e).to.have.deep.property('data.error', 'not_found');
                    }));
                });
                return Promise.all(promises);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
