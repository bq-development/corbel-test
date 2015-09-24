describe('In IAM module', function() {

    describe('while testing user groups', function() {
        var corbelDriver;
        var userId;
        var random;
        var domainEmail = '@funkifake.com';

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            random = Date.now();

            corbelDriver.iam.users()
            .create({
                'firstName':'firstNameTest',
                'email': 'userTest' + random + domainEmail,
                'username':'userTest' + random + domainEmail
            })
            .should.eventually.be.fulfilled
            .then(function(id) {
                userId = id;
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

        it('an error [404] is returned while trying to add a group to a nonexistent user', function(done) {
            
            corbelDriver.iam.user('unexistent')
            .addGroups(['groupTest1'])
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to add a malformed group to a user', function(done) {
            
            corbelDriver.iam.user(userId)
            .addGroups('malformed')
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to add a group to a user without authorithation', function(done) {
            var corbelUnauthorizedDriver = corbelTest.drivers['DEFAULT_USER'];
            
            corbelUnauthorizedDriver.iam.user(userId)
            .addGroups(['groupTest1'])
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error [404] is returned while trying to delete a group for an unexistent user', function(done) {
            
            corbelDriver.iam.user('unexistent')
            .deleteGroup(['groupTest1'])
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to add a group to a user without authorithation', function(done) {
            var corbelUnauthorizedDriver = corbelTest.drivers['DEFAULT_USER'];
            
            corbelUnauthorizedDriver.iam.user(userId)
            .deleteGroup(['groupTest1'])
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });
    });
});
