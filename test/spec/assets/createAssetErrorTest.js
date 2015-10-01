describe('In ASSETS module', function() {
    describe('when creating an asset', function() {

        var corbelDriver;
        var EXPIRE_VALUE = Math.round((new Date().getTime() / 1000)) + 7203500;
        var getBaseAsset = function(){
            return {
                userId: '1',
                name: 'createAssetTest',
                productId: String(Date.now()),
                expire: EXPIRE_VALUE,
                active: true,
                scopes: ['assets:asset']
            };
        };

        describe('while using a non-authorized user', function() {
            before(function(done) {
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelTest.common.clients.loginUser(
                    corbelDriver, corbelDriver.config.get('username'), corbelDriver.config.get('password'))
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('asset is not created due to authorization reasons', function(done) {
                corbelDriver.assets().create(getBaseAsset())
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
            });
        });

        describe('while using an admin user', function() {

            before(function(done) {
                corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
                corbelTest.common.clients.loginUser(
                    corbelDriver, corbelDriver.config.get('username'), corbelDriver.config.get('password'))
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('asset is not created since it has no scopes defined', function(done) {

                var asset = getBaseAsset();
                delete asset.scopes;
                corbelDriver.assets().create(asset)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                })
                .should.notify(done);
            });

            it('asset is not created since defined scopes are not valid', function(done) {

                var asset = getBaseAsset();
                asset.scopes = [ 'assets = asset' ];
                corbelDriver.assets().create(asset)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                })
                .should.notify(done);
            });

            it('asset is not created since it has not been defined ', function(done) {
                corbelDriver.assets().create()
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 422);
                })
                .should.notify(done);
            });
        });
    });
});