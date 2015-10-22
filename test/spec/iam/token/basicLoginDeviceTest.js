describe('In IAM module', function() {

    var corbelDriver;
    var userId;
    var corbelDriverAdmin;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        corbelDriverAdmin = corbelTest.drivers['ADMIN_CLIENT'].clone();
    });


    after(function(done) {
        corbelDriverAdmin.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled.and.notify(done);
    });

    it('when request to create a new user and login with basic ' +
        'and specific device id successes returning user',
        function(done) {

            var device = {
                notificationUri: '123',
                uid: '123',
                name: 'device',
                type: 'Android',
                notificationEnabled: true
            };

            var random = Date.now();

            var userCreate = {
                'firstName': 'createUserIam',
                'email': 'createUserIam.iam.',
                'username': 'createUserIam.iam.',
            };
            var domainEmail = '@funkifake.com';
            var user = {
                'firstName': userCreate.firstName,
                'email': userCreate.email + random + domainEmail,
                'username': userCreate.username + random + domainEmail,
                'password': 'myPassword'
            };

            var tokenValidation = /^.+\..+\..+$/;


            corbelDriverAdmin.iam
                .users()
                .create(user)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    userId = id;

                    return corbelDriverAdmin.iam.user(userId)
                        .registerDevice(device)
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriverAdmin.iam.user(userId)
                        .getDevices()
                        .should.be.eventually.fulfilled;
                })
                .then(function(responseDevice) {
                    device = responseDevice.data[0];

                    return corbelTest.common.clients.loginUser(corbelDriver, user.email, user.password,
                            device.deviceId)
                        .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    var accessToken = response.data.accessToken;
                    expect(response.data.accessToken).to.match(tokenValidation);
                    var tokenContent = JSON.parse(window.atob(accessToken.split('.')[0]));
                    expect(tokenContent.deviceId).to.be.equal(device.deviceId);
                })
                .should.notify(done);
        });
});
