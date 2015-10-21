describe('In IAM module', function() {

    describe('while testing update user', function() {
        var corbelDriver;
        var userId;
        var emailDomain = '@funkifake.com';

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'];
        });

        beforeEach(function(done) {

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(user) {
                userId = user.id;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
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

        it('an error is returned while trying to update an username with another that already exists', function(done) {
            var secondUserId;
            var newUserName = 'NewUserName' + Date.now();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(user) {
                secondUserId = user.id;

                return corbelDriver.iam.user(userId)
                .update({
                    'username': newUserName
                })
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(secondUserId)
                .update({
                    'username': newUserName
                })
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'conflict');
            })
            .then(function() {
                return corbelDriver.iam.user(secondUserId)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('an error is returned while trying to update an email with another that already exists', function(done) {
            var secondUserId;
            var newEmail = 'NewEmail' + Date.now() + emailDomain;

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(user) {
                secondUserId = user.id;

                return corbelDriver.iam.user(userId)
                .update({
                    'email': newEmail
                })
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(secondUserId)
                .update({
                    'email': newEmail
                })
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'conflict');
            })
            .then(function() {
                return corbelDriver.iam.user(secondUserId)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('an error [403] is returned while trying to update an user with incorrect email', function(done) {
            corbelDriver.iam.user(userId)
            .update({
                'email': 'incorrect'
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [403] is returned while trying to update an user with incorrect scopes', function(done) {
            corbelDriver.iam.user(userId)
            .update({
                'scopes': ['incorrect:scope']
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'scopes_not_allowed');
            })
            .should.notify(done);
        });

        it('an error [404] is returned while trying to update an unexistent user', function(done) {

            corbelDriver.iam.user('unexistent')
            .update({
                'firstName': 'user Modified'
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
