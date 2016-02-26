describe('In IAM module', function() {
    var corbelRootDriver;
    var deviceFields = ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'];

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    describe('while testing firstConnection and lastConnection dates in devices', function() {
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

        var expectDeviceLastConnectionAndFirstConnectionTimeNearToDateNow = function(device) {
            var baseTime = Date.now();
            var start = baseTime - 1000 * 30;
            var finish = baseTime + 1000 * 30;
            expect(device.firstConnection).within(start, finish);
            expect(device.lastConnection).within(start, finish);
        };

        it('users can register his devices using user(me) and' +
            ' the device has firstConnection and lastConnection',
            function(done) {
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
                        expectDeviceLastConnectionAndFirstConnectionTimeNearToDateNow(device);
                        expect(device.firstConnection).to.be.equals(device.lastConnection);
                    })
                    .should.notify(done);
            });

        it('users can register his devices using user(me)' +
            ' and when login with it, lastConnection change',
            function(done) {
                var deviceId;
                corbelDriver.iam.user('me')
                    .registerDevice(device)
                    .should.be.eventually.fulfilled
                    .then(function(id) {
                        deviceId = id;
                        return corbelDriver.iam.user('me')
                            .getDevice(deviceId)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(responseDevice) {
                        device = responseDevice.data;
                        expectDeviceLastConnectionAndFirstConnectionTimeNearToDateNow(device);
                        expect(device._updatedAt).to.be.equals(device.firstFirstConnection);
                        return corbelTest.common.clients.loginUser(corbelDriver,
                                user.username, user.password, device.uid)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return corbelDriver.iam.user('me')
                            .getDevice(deviceId)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(responseDevice) {
                        device = responseDevice.data;
                        expectDeviceLastConnectionAndFirstConnectionTimeNearToDateNow(device);
                        expect(device.lastConnection).to.be.above(device.firstConnection);
                    })
                    .should.notify(done);
            });

        it('users can register his device with lastConnection and' +
            ' firstConnection using user(me),' +
            ' but server ignore user these fields',
            function(done) {
                device.firstConnection = 1;
                device.lastConnection = 1;
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
                        expectDeviceLastConnectionAndFirstConnectionTimeNearToDateNow(device);
                        expect(device.firstConnection).to.be.equals(device.lastConnection);
                    })
                    .should.notify(done);
            });
    });
});
