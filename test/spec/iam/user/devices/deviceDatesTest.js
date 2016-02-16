describe('In IAM module', function() {
    var corbelRootDriver;
    var deviceFields = ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'];

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    describe('while testing creation and update dates in devices', function() {
        var user;
        var corbelDriver;
        var random;
        var device;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUsers) {
                    user = createdUsers[0];

                    return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        beforeEach(function() {
            device = {
                notificationUri: Date.now(),
                uid: Date.now(),
                name: 'device',
                type: 'Android',
                notificationEnabled: true
            };
        });

        after(function(done) {
            corbelDriver.iam.user('me')
                .delete()
                .should.be.eventually.fulfilled
                .should.notify(done);
        });

        it('users can register his devices using user(me) and the device has _updateAt and _createdAt', function(done) {
            var retriveDevice;

            corbelDriver.iam.user('me')
                .registerDevice(device)
                .should.be.eventually.fulfilled
                .then(function(deviceId) {
                    return corbelDriver.iam.user('me')
                        .getDevice(deviceId)
                        .should.be.eventually.fulfilled;
                })
                .then(function(responseDevice) {
                    device = responseDevice.data;
                    var start = Date.now() - 60;
                    var finish = start + 60 * 2;
                    expect(device._updatedAt).within(start, finish);
                    expect(device._updatedAt).to.be.equals(device._createdAt);
                })
                .should.notify(done);
        });

        it('users can register his devices using user(me) and when update it, _updateAt change', function(done) {
            var firstUpdatedAt;
            var firstCreatedAt;
            corbelDriver.iam.user('me')
                .registerDevice(device)
                .should.be.eventually.fulfilled
                .then(function(deviceId) {
                    return corbelDriver.iam.user('me')
                        .getDevice(deviceId)
                        .should.be.eventually.fulfilled;
                })
                .then(function(responseDevice) {
                    device = responseDevice.data;
                    var start = Date.now() - 60;
                    var finish = start + 60 * 2;
                    expect(device._updatedAt).within(start, finish);
                    expect(device._updatedAt).to.be.equals(device._createdAt);
                    firstUpdatedAt = device._updatedAt;
                    firstCreatedAt = device._createdAt;
                    return corbelDriver.iam.user('me')
                        .registerDevice(device)
                        .should.be.eventually.fulfilled;
                })
                .then(function(deviceId) {
                    return corbelDriver.iam.user('me')
                        .getDevice(deviceId)
                        .should.be.eventually.fulfilled;
                })
                .then(function(responseDevice) {
                    device = responseDevice.data;
                    var start = Date.now() - 60;
                    var finish = start + 60 * 2;
                    expect(device._updatedAt).within(start, finish);
                    expect(device._updatedAt).to.be.above(device._createdAt);
                })
                .should.notify(done);
        });

        it('users can register his device with _updateAt and _createdAt using user(me), ' +
            'but server ignore user _updateAt and _createAt', function(done) {
                device._updatedAt = 1;
                device._createdAt = 1;
                corbelDriver.iam.user('me')
                    .registerDevice(device)
                    .should.be.eventually.fulfilled
                    .then(function(deviceId) {
                        return corbelDriver.iam.user('me')
                            .getDevice(deviceId)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(responseDevice) {
                        device = responseDevice.data;
                        var start = Date.now() - 60;
                        var finish = start + 60 * 2;
                        expect(device._updatedAt).within(start, finish);
                        expect(device._updatedAt).to.be.equals(device._createdAt);
                    })
                    .should.notify(done);
            });
    });
});
