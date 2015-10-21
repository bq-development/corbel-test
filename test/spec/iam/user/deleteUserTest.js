describe('In IAM module', function() {

    describe('while testing delete user', function() {
        var corbelDriver;
        var userId;
        var emailDomain = '@funkifake.com';
        var userDeleteTest = {
            'firstName': 'userDelete',
            'email': 'user.delete.',
            'username': 'user.delete.'
        };

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'];
        });

        beforeEach(function(done) {

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(user) {
                userId = user.id;
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
    });
});
