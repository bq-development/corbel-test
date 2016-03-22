describe('In ASSETS module,', function() {
    describe('when add new asset to a user,', function() {
        var loginAsRandomUser = corbelTest.common.clients.loginAsRandomUser;
        var adminCorbelDriver;
        var corbelDriver;
        var user;
        var assetId;
        var asset;

        beforeEach(function(done) {
            adminCorbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            loginAsRandomUser(corbelDriver)
                .should.be.eventually.fulfilled
                .then(function(data) {
                    user = data.user;
                    asset = {
                        userId: user.id,
                        name: 'asset',
                        productId: String(Date.now()),
                        expire: corbelTest.common.assets.getExpire(),
                        active: true,
                        scopes: ['assets:asset']
                    };
                    return adminCorbelDriver.assets.asset().create(asset)
                        .should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    assetId = id;
                })
                .should.notify(done);
        });

        afterEach(function(done) {
            adminCorbelDriver.assets.asset(assetId).delete()
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.iam.user('me').delete()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });


        it('he can get it', function(done) {
            corbelDriver.assets.asset().get()
                .should.be.eventually.fulfilled
                .then(function(assets) {
                    expect(assets).to.have.deep.property('data.length', 1);
                    expect(assets).to.have.deep.property('data[0].name', asset.name);
                    expect(assets).to.have.deep.property('data[0].productId', asset.productId);
                })
                .should.notify(done);
        });

    });
});
