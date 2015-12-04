describe('In IAM module', function() {
    var corbelDriver;
    var user;

    describe('while testing email endpoints', function() {

        before(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUser) {
                user = createdUser[0];
            })
            .should.notify(done);
        });

        after(function(done){
            corbelDriver.iam.user(user.id)
                .delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when getting user id through email', function () {

            it('user id is returned if the email is being used', function(done) {
                corbelDriver.iam.email()
                    .getUserId(user.email)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.id',user.id);
                })
                .should.notify(done);
            });

            it('an error [404] is returned if the email is not being used', function(done) {
                corbelDriver.iam.email()
                    .getUserId(Date.now())
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });
        });

        describe('when checking email availability', function () {

            it('false should be returned if the email is being used', function(done) {
                corbelDriver.iam.email()
                    .availability(user.email)
                .should.be.eventually.fulfilled
                .then(function(availability) {
                    expect(availability).to.be.equals(false);
                })
                .should.notify(done);
            });

            if (window.chrome) {
                it('true should be returned if the email is not being used', function(done) {
                    corbelDriver.iam.email()
                        .availability(Date.now())
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
