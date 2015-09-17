describe('In IAM module, testing username endpoint ', function() {
    var userId;
    var username;
    var corbelDriver;

    before(function(done) {
        corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();

        username = 'registerUser' + Date.now() + '@funkifake.com';

        corbelTest.common.iam.createUser({
            'firstName': 'registerUser',
            'lastName': 'registerUser',
            'email': username,
            'username': username,
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
        corbelDriver.iam.user(userId)
        .delete()
        .should.be.eventually.fulfilled.and.notify(done);
    });

    describe('in getting users id by username', function() {
        it('should return users id if the username is in use', function(done) {
            corbelDriver.iam.username()
            .getUserId(username)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.id',userId);
            })
            .should.notify(done);
        });

        it('should respond with error 404 if the username is not in use', function(done) {
            corbelDriver.iam.username()
            .getUserId('test' + username)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
            })
            .should.notify(done);
        });
    });

    describe('in checking username\'s availability', function () {
        it('should return false if the username is in use', function(done) {
            corbelDriver.iam.username()
            .availability(username)
            .should.be.eventually.fulfilled
            .then(function(availability) {
                expect(availability).to.be.equals(false);
            })
            .should.notify(done);
        });

        //TODO FIX TEST PHANTOMJS
        if (window.chrome) {
            it('should return true if the username is not in use', function(done) {
                corbelDriver.iam.username()
                .availability('test' + username)
                .should.be.eventually.fulfilled
                .then(function(availability) {
                    expect(availability).to.be.equals(true);
                })
                .should.notify(done);
            });
        } else {
            it.skip('should return false (PHANTOM HEAD PROBLEM) if the username is in use', function() {});
        }
    });
});
