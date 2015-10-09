describe('In IAM module', function() {

    describe('while testing updateMe', function() {
        var corbelDriver;
        var corbelRootDriver;
        var userId;
        var random;
        var username;
        var password;

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            random = Date.now();
            username = 'user.updateMe' + random + '@funkifake.com';
            password = 'passUpdateMe';

            corbelDriver.iam.users()
            .create({
                'firstName': 'userUpdateMe',
                'lastName': 'userUpdateMe',
                'email': 'user.updateMe' + random + '@funkifake.com',
                'username': username,
                'password': password
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;

                return corbelTest.common.clients.loginUser(corbelDriver, username, password)
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
                .should.eventually.be.rejected;
            })
            .then(function(response) {
                expect(response).to.have.property('status', 404);
                expect(response).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error [401] is returned while trying to use updateMe with no logged user', function(done) {

            corbelDriver.iam.user('me')
            .signOut()
            .should.be.eventually.fulfilled
            .then(function(){
                return corbelDriver.iam.user()
                .updateMe({
                    'firstName': 'user Modified Me'
                })
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'invalid_token');
            })
            .should.notify(done);
        });

        it('an error [401] is returned while trying to use user("me").update with no logged user', function(done) {

            corbelDriver.iam.user('me')
            .signOut()
            .should.be.eventually.fulfilled
            .then(function(){
                return corbelDriver.iam.user('me')
                .update({
                    'firstName': 'user Modified Me'
                })
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'invalid_token');
            })
            .should.notify(done);
        });
    });
});
