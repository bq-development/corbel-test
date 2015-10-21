describe('In IAM module', function() {

    describe('while testing updateMe', function() {
        var corbelDriver;
        var corbelRootDriver;
        var user;

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.eventually.be.rejected;
            })
            .then(function(response) {
                expect(response).to.have.property('status', 404);
                expect(response).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('user firsname is updated through updateMe', function(done) {
            corbelDriver.iam.user('me')
            .updateMe({
                'firstName': 'user Modified Me'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.firstName','user Modified Me');
            })
            .should.notify(done);
        });

        it('user firsname is updated through user("me")', function(done) {
            corbelDriver.iam.user('me')
            .update({
                'firstName': 'user Modified Me'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.firstName','user Modified Me');
            })
            .should.notify(done);
        });

        it('user firsname and lastname are updated through updateMe', function(done) {
            corbelDriver.iam.user('me')
            .updateMe({
                'firstName': 'user Modified Me',
                'lastName': 'new lastName'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.firstName','user Modified Me');
                expect(response).to.have.deep.property('data.lastName','new lastName');
            })
            .should.notify(done);
        });

        it('user firsname and lastname are updated through user("me")', function(done) {
            corbelDriver.iam.user('me')
            .update({
                'firstName': 'user Modified Me',
                'lastName': 'new lastName'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.firstName','user Modified Me');
                expect(response).to.have.deep.property('data.lastName','new lastName');
            })
            .should.notify(done);
        });

        it('user username is updated through updateMe', function(done) {
            corbelDriver.iam.user('me')
            .updateMe({
                'username': 'modified username'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.username','modified username');
            })
            .should.notify(done);
        });

        it('user username is updated through user("me")', function(done) {
            corbelDriver.iam.user('me')
            .update({
                'username': 'modified username'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.username','modified username');
            })
            .should.notify(done);
        });

        it('user email is updated through updateMe', function(done) {
            var newEmail = 'modifiedemail@funkifake.com';

            corbelDriver.iam.user('me')
            .updateMe({
                'email': newEmail
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.email', newEmail);
            })
            .should.notify(done);
        });

        it('user email is updated through user("me")', function(done) {
            var newEmail = 'modifiedemail@funkifake.com';
            corbelDriver.iam.user('me')
            .update({
                'email': newEmail
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.email', newEmail);
            })
            .should.notify(done);
        });

        it('user scopes are not updated through updateMe', function(done) {
            corbelDriver.iam.user('me')
            .updateMe({
                'scopes': ['ec:purchase:admin']
            })
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response.data.scopes).not.to.include('ec:purchase:admin');
            })
            .should.notify(done);
        });

        it('user scopes are not updated through user("me")', function(done) {
            corbelDriver.iam.user('me')
            .update({
                'scopes': ['ec:purchase:admin']
            })
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response.data.scopes).not.to.include('ec:purchase:admin');
            })
            .should.notify(done);
        });
    });
});
