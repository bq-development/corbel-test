describe('In ASSETS module', function() {
    describe('when an admin creates multiple assets', function(){
        var corbelDriver;
        var userData, user;
        var countArray = [30, 50, 60, 200];
        var createdAssetsIds;
        var promises;

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
            promises = [];
            createdAssetsIds.forEach(function(assetId){
                promises.push(corbelDriver.assets.asset(assetId).delete()
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.assets.asset(assetId).get()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                }));
            });
            return Promise.all(promises)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(user.id).delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        countArray.forEach(function(count){
            it('token gets upgraded when '+count+' assets are assigned to an user', function(done) {
                corbelTest.common.assets.createMultipleAssets(corbelDriver, count, user.id)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    createdAssetsIds = response;
                    return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.assets.asset().access()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });
        });
    });
});
