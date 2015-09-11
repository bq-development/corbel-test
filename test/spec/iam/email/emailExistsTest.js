describe('In IAM module', function() {
    var corbelDriver;
    var userId;
    var email;

    describe('when working with email endpoints', function() {

        before(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'];

            email = 'registerUser' + Date.now() + '@funkifake.com';

            corbelTest.common.iam.createUser({
                'firstName': 'registerUser',
                'lastName': 'registerUser',
                'email': email,
                'username': email,
                'password': 'passRegisterUser',
                'oauthService': 'silkroad'
            }, corbelDriver)
            .should.be.eventually.fulfilled
            .then(function(data){
                userId = data.id;
            })
            .should.notify(done);
        });

        after(function(done){
            corbelTest.common.iam.deleteUser(userId, corbelDriver)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('in getting user\'s id by email', function () {
            it('should return user\'s id if the email is in use', function(done) {
                corbelDriver.iam.email().getUserId(email)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.id).to.be.equals(userId);
                })
                .should.notify(done);
            });

            it('should respond with error 404 if the email is not in use', function(done) {
                corbelDriver.iam.email().getUserId('test' + email)
                .should.eventually.be.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                })
                .should.notify(done);
            });
        });

        describe('in checking email\'s availability', function () {
            it('should return false if the email is in use', function(done) {
                corbelDriver.iam.email().availability(email)
                .should.be.eventually.fulfilled
                .then(function(availability) {
                    expect(availability).to.be.equals(false);
                })
                .should.notify(done);
            });

            if (window.chrome) {
                it('should return true if the email is not in use', function(done) {
                    corbelDriver.iam.email().availability(Date.now()+email)
                    .then(function(availability) {
                        expect(availability).to.be.equals(true);
                    })
                    .should.notify(done);
                });
            } else {
                it.skip('should return false (PHANTOM HEAD PROBLEM) if the email is in use', function() {});
            }
        });
    });
});
