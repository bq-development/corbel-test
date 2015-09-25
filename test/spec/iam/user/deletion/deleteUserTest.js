describe('In IAM module', function() {

    describe('while testing delete user', function() {
        var corbelDriver;
        var corbelRootDriver;
        var userId;
        var emailDomain = '@funkifake.com';
        var random;
        var user = {
            'firstName': 'userDelete',
            'email': 'user.delete.',
            'username': 'user.delete.',
            'password': 'pass'
        };

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            random = Date.now();
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();

            corbelDriver.iam.users()
            .create({
                'firstName': user.firstName,
                'email': user.email + random + emailDomain,
                'username': user.username + random,
                'password': user.password
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;
            })
            .should.notify(done);
        });

        it('basic user is deleted', function(done) {

            corbelDriver.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e){
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('basic user is deleted using "me"', function(done) {

            corbelTest.common.clients.loginUser
                (corbelDriver, user.username + random, user.password)
            .should.be.eventually.fulfilled
            .then(function(){
                return corbelDriver.iam.user('me')
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e){
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('basic user and his devices are deleted', function(done) {
            var deviceId;

            var device = {
                notificationUri: '123',
                uid: '123',
                name: 'My device',
                type: 'Android',
                notificationEnabled: true
            };

            corbelDriver.iam.user(userId)
            .registerDevice(device)
            .should.eventually.be.fulfilled
            .then(function(id) {
                deviceId = id;
                
                return corbelDriver.iam.user(userId)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(userId)
                .getDevice(deviceId)
                .should.eventually.be.rejected;
            }).
            then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
                expect(e).to.have.deep.property('data.errorDescription', 'Not found');
            })
            .should.notify(done);
        });

        it('basic user and his devices are deleted using "me"', function(done) {
            var deviceId;

            var device = {
                notificationUri: '123',
                uid: '123',
                name: 'My device',
                type: 'Android',
                notificationEnabled: true
            };

            corbelDriver.iam.user(userId)
            .registerDevice(device)
            .should.eventually.be.fulfilled
            .then(function(id) {
                deviceId = id;
                
                return corbelTest.common.clients.loginUser
                    (corbelDriver, user.username + random, user.password)
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.iam.user('me')
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .getDevice(deviceId)
                .should.eventually.be.rejected;
            }).
            then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
                expect(e).to.have.deep.property('data.errorDescription', 'Not found');
            })
            .should.notify(done);
        });
    });
});
