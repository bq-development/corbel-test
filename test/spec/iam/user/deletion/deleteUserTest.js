describe('In IAM module', function() {

    describe('while testing delete user', function() {
        var corbelDriver;
        var corbelRootDriver;
        var user;

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];
            })
            .should.notify(done);
        });

        it('basic user is deleted', function(done) {

            corbelDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(user.id)
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
                (corbelDriver, user.username, user.password)
            .should.be.eventually.fulfilled
            .then(function(){
                return corbelDriver.iam.user('me')
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
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
            var deviceId = '123';

            var device = {
                notificationUri: '123',
                name: 'My device',
                type: 'Android',
                notificationEnabled: true
            };

            corbelDriver.iam.user(user.id)
            .registerDevice(deviceId, device)
            .should.be.eventually.fulfilled
            .then(function(id) {
                expect(id).to.be.equals(deviceId);
                return corbelDriver.iam.user(user.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(user.id)
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
            var deviceId = '123';

            var device = {
                notificationUri: '123',
                name: 'My device',
                type: 'Android',
                notificationEnabled: true
            };

            corbelDriver.iam.user(user.id)
            .registerDevice(deviceId, device)
            .should.be.eventually.fulfilled
            .then(function(id) {
                deviceId = id;

                return corbelTest.common.clients.loginUser
                    (corbelDriver, user.username, user.password)
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.iam.user('me')
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
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
