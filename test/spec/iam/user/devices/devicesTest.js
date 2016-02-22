describe('In IAM module', function() {
    var corbelRootDriver;

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    describe('while testing devices', function() {
        var user;
        var corbelDriver;
        var random;
        var device = {
            notificationUri: '123',
            uid: '123',
            name: 'device',
            type: 'Android',
            notificationEnabled: true
        };  

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an admin can register devices and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user(user.id)
            .registerDevice(device)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .getDevices()
                .should.be.eventually.fulfilled;
            })
            .then(function(responseDevice) {
                retriveDevice = responseDevice.data[0];
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                expect(retriveDevice.userId).to.be.equals(user.id);
                device.name = 'My black device';

                return corbelDriver.iam.user(user.id)
                .registerDevice(device)
                .should.be.eventually.fulfilled;
            })
            .then(function(deviceId) {
                expect(deviceId).to.be.equals(retriveDevice.uid);
                retriveDevice.name = device.name;

                return corbelDriver.iam.user(user.id)
                .getDevice(deviceId)
                .should.be.eventually.fulfilled;
            })
            .then(function(responseDevice) {
                return corbelDriver.iam.user(user.id)
                .deleteDevice(responseDevice.data.uid)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .getDevices()
                .should.be.eventually.fulfilled;
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('users can register his devices using registerMyDevice and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user()
            .getMyDevices()
            .should.be.eventually.fulfilled
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);

                return corbelDriver.iam.user()
                .registerMyDevice(device)
                .should.be.eventually.fulfilled;
            })
            .then(function(deviceId) {
                return corbelDriver.iam.user()
                .getMyDevice(deviceId)
                .should.be.eventually.fulfilled;
            })
            .then(function(responseDevice) {
                retriveDevice = responseDevice.data;
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                expect(retriveDevice.userId).to.be.equals(user.id);
                device.name = 'My black device';

                return corbelDriver.iam.user()
                .registerMyDevice(device)
                .should.be.eventually.fulfilled;
            })
            .then(function(deviceId) {
                expect(deviceId).to.be.equals(retriveDevice.id);
                retriveDevice.name = device.name;

                return corbelDriver.iam.user()
                .getMyDevices()
                .should.be.eventually.fulfilled;
            })
            .then(function(responseDevices) {
                var auxResponseDevices = responseDevices.data || undefined;
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled', 'domain', 'id'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(auxResponseDevices[0][key]);
                });

                return corbelDriver.iam.user()
                .deleteMyDevice(auxResponseDevices[0].id)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user()
                .getMyDevices()
                .should.be.eventually.fulfilled;
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('users can register his devices using user and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user('me')
            .getDevices()
            .should.be.eventually.fulfilled
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);

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
                retriveDevice = responseDevice.data;
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                expect(retriveDevice.userId).to.be.equals(user.id);
                device.name = 'My black device';

                return corbelDriver.iam.user('me')
                .registerDevice(device)
                .should.be.eventually.fulfilled;
            })
            .then(function(deviceId) {
                expect(deviceId).to.be.equals(retriveDevice.id);
                retriveDevice.name = device.name;

                return corbelDriver.iam.user('me')
                .getDevices()
                .should.be.eventually.fulfilled;
            })
            .then(function(responseDevices) {
                var auxResponseDevices = responseDevices.data || undefined;
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled', 'domain', 'id'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(auxResponseDevices[0][key]);
                });

                return corbelDriver.iam.user('me')
                .deleteDevice(auxResponseDevices[0].id)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user('me')
                .getDevices()
                .should.be.eventually.fulfilled;
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });
    });
});
