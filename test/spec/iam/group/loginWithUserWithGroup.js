describe('In IAM module', function() {

      describe('when login with a user with group,', function() {
        var corbelRootDriver;
        var corbelDriver;
        var groupName;
        var groupId;
        var user;

        before(function(done) {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelDriver.config.set('scopes', '');

            corbelTest.common.iam.createUsers(corbelDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    user = response[0];
                    groupName = 'LoginGroup' + Date.now();
                    return corbelRootDriver.iam.group()
                        .create({
                            name: groupName,
                            scopes: ['iam:user:read']
                        })
                        .should.be.eventually.fulfilled;
                })
                .then(function(responseGroupId) {
                    groupId = responseGroupId;
                })
                .should.notify(done);
        });

        after(function(done) {
            return corbelDriver.iam.user('me').delete()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    return corbelRootDriver.iam.group(groupId).delete()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('user obtains group scopes', function(done) {
            corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    return corbelDriver.iam.user(user.id).get()
                        .should.be.eventually.rejected;
                })
                .then(function(response) {
                    return corbelRootDriver.iam.user(user.id)
                        .update({
                            'groups': [groupName]
                        })
                        .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                        .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    return corbelDriver.iam.user(user.id).get()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

    });
});
