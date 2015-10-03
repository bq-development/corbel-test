describe('In ASSETS module', function() {
    describe('when deleting an asset', function() {
        var corbelDriver;

        describe('while using a non-authorized user', function() {
            before(function() {
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            });

            it('asset is not deleted due to authorization reasons', function(done) {
                corbelDriver.assets('assetId')
                .delete()
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
            });
        });

        describe('while using an admin user', function() {

            before(function() {
                corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            });

            it('asset is not deleted because it does not exist', function(done) {

                corbelDriver.assets('nonExistent')
                .delete()
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });

            it('asset is deleted', function(done) {
                var assetId;

                corbelDriver.assets()
                .create(corbelTest.common.assets.getAsset())
                .should.be.eventually.fulfilled
                .then(function(id) {
                    assetId = id;

                    return corbelDriver.assets(assetId)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.id', assetId);

                    return corbelDriver.assets(assetId)
                    .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.assets(assetId)
                    .get()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });

            it('permanent asset is deleted', function(done) {
                var asset = corbelTest.common.assets.getAsset();
                asset.expire = null;
                var assetId;

                corbelDriver.assets()
                .create(asset)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    assetId = id;

                    return corbelDriver.assets(assetId)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.id', assetId);

                    return corbelDriver.assets(assetId)
                    .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.assets(assetId)
                    .get()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });
        });
    });
});
