describe('In ASSETS module, testing createAsset', function() {
    describe('when creating a permanent asset', function(){
        var assetId, user;
        var clientCorbelDriver, userCorbelDriver;
        var NEW_SCOPES = ['borrow:lender:root'];

        before(function() {
            clientCorbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
            userCorbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        after(function(done) {
            return userCorbelDriver.assets(assetId).delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return userCorbelDriver.iam.user(user.id).delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('asset is created and assigned correctly', function(done) {

            var asset = corbelTest.common.assets.getAsset(NEW_SCOPES);
            asset.expire = null;

            corbelTest.common.iam.createUsers(clientCorbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(response) {
                user = response[0];
                asset.userId = user.id;

                return userCorbelDriver.assets().create(asset)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                assetId = id;

                return userCorbelDriver.assets(assetId).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data).to.have.property('id', assetId);
                expect(response.data).to.have.property('userId', user.id);
                expect(response.data).to.have.property('scopes').
                that.is.an('array').and.contain(NEW_SCOPES[0]);
                return corbelTest.common.clients.loginUser(clientCorbelDriver, user.username, user.password)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return clientCorbelDriver.borrow.lender().getAll()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                return clientCorbelDriver.assets().access()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return clientCorbelDriver.borrow.lender().getAll()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });
    });
});