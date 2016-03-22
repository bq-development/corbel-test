describe('In ASSETS module', function() {
    describe('admin add asset to a user', function() {

        var getAsset = corbelTest.common.assets.getAsset;
        var loginAsRandomUser = corbelTest.common.clients.loginAsRandomUser;

        var corbelAdminDriver;
        var corbelDriver;
        var asset;
        var user;

        before(function(done) {
            corbelAdminDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            asset = getAsset();
            loginAsRandomUser(corbelDriver)
                .should.be.eventually.fulfilled
                .then(function(data) {
                    user = data.user;
                    asset.userId = user.id;
                    return corbelAdminDriver.assets.asset().create(asset)
                        .should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    asset.id = id;
                })
                .should.notify(done);
        });

        after(function(done) {
            corbelAdminDriver.assets.asset(asset.id).delete()
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.iam.user('me').delete()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('and user success to get it', function(done) {
            corbelDriver.assets.asset().get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].id', asset.id);
                    expect(response).to.have.deep.property('data[0].productId', asset.productId);
                    expect(response).to.have.deep.property('data[0].userId', asset.userId);
                    expect(response).to.have.deep.property('data[0].scopes').and.to.eql(asset.scopes);
                    expect(response).to.have.deep.property('data[0].name', asset.name);
                    expect(response).to.have.deep.property('data[0].expire', asset.expire);
                    expect(response).to.have.deep.property('data[0].active', asset.active);
                })
                .should.notify(done);
        });

        it('and another user failed to get it', function(done) {
            var anotherUserCorbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            loginAsRandomUser(anotherUserCorbelDriver)
                .should.be.eventually.fulfilled
                .then(function(data) {
                    return anotherUserCorbelDriver.assets.asset().get()
                        .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                    return anotherUserCorbelDriver.iam.user('me').delete()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});
