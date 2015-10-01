describe('In ASSETS module', function() {
    describe('when an admin creates multiple assets', function(){
        var corbelDriver;
        var userData, user;
        var countArray = [30, 50, 60, 200];

        beforeEach(function(done){
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(response) {
                user = response[0];
            })
            .should.notify(done);
        });

        afterEach(function(done){
            corbelDriver.iam.user(user.id).delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        countArray.forEach(function(count){
            it('token gets upgraded when '+count+' assets are assigned to an user', function(done) {
                corbelTest.common.assets.createMultipleAssets(corbelDriver, count, user.id)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .should.be.eventually.rejected
                .then(function() {
                    return corbelDriver.assets().access()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });
        });
    });
});
