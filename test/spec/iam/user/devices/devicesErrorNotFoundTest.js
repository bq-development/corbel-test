describe('In IAM module', function() {
    var userId;
    var corbelDriver, corbelRootDriver;
    var random;
    var user = {
        'firstName': 'userGet',
        'email': 'user.get.',
        'username': 'user.get.',
        'password': 'pass'
    };
    var emailDomain = '@funkifake.com';

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    describe('while testing not found errors in devices', function() {

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
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
        var device = {
            notificationUri: '123',
            uid: '123',
            name: 'device',
            type: 'Android',
            notificationEnabled: true
        };


        it('fails with 404 not found when request retrieve a not existing device information', function(done) {
            corbelDriver.iam.user(userId)
            .getDevice('notExistingId')
            .should.eventually.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('fails with 404 not found when request delete an not existing device', function(done) {
            corbelDriver.iam.user()
            .deleteMyDevice('notExistingId')
            .then(function() {
                return corbelDriver.iam.user()
                .getMyDevices()
                .should.eventually.be.fulfilled;
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });
    });
});
