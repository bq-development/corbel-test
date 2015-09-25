describe('In IAM module', function() {

    describe('while testing get user', function() {
        var corbelDriver;
        var corbelRootDriver;
        var random;
        var userId;
        var emailDomain = '@funkifake.com';
        var user = {
            'firstName': 'userGet',
            'email': 'user.get.',
            'username': 'user.get.',
            'password': 'pass'
        };

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            random = Date.now();

            corbelDriver.iam.users()
            .create({
                'firstName': user.firstName + random,
                'email': user.email + random + emailDomain,
                'username': user.username + random + emailDomain,
                'password': user.password
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;

                return corbelTest.common.clients.loginUser
                    (corbelDriver, user.username + random + emailDomain, user.password)
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

        it('a logged user is got through user("me").get()', function(done) {

            corbelDriver.iam.user('me')
            .get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.firstName', user.firstName + random);
                expect(response).to.have.deep.property('data.id', userId);
            })
            .should.notify(done);
        });

        it('a logged user is got through user().get()', function(done) {

            corbelDriver.iam.user()
            .get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.firstName', user.firstName + random);
                expect(response).to.have.deep.property('data.id', userId);
            })
            .should.notify(done);
        });

        it('a user is got through admin driver and userId', function(done) {

            corbelRootDriver.iam.user(userId)
            .get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.firstName', user.firstName + random);
                expect(response).to.have.deep.property('data.id', userId);
            })
            .should.notify(done);
        });

        it('all users are got through admin driver', function(done) {

            var user2Id;
            random = Date.now();

            corbelDriver.iam.users()
            .create({
                'firstName': user.firstName + random,
                'email': user.email + random + emailDomain,
                'username': user.username + random + emailDomain,
                'password': user.password
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                user2Id = id;

                return corbelRootDriver.iam.users()
                .get()
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

        it('a user is got through admin driver and a query using equal', function(done) {
            var params = {
                query: [{
                    '$eq': {
                        'firstName': user.firstName + random
                    }
                }]
            };

            corbelRootDriver.iam.users()
            .get(params)
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
            .get(params)
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
            .get(params)
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
                .get(params)
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
