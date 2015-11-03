describe('In ASSETS module', function() {
    describe('when creating assets with an admin user', function(){
        var corbelDriver;
        var createdAssetsIds;
        var promises;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        beforeEach(function(){
            createdAssetsIds = [];
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
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('asset gets created', function(done) {
            var assetId;

            corbelDriver.assets.asset().create(corbelTest.common.assets.getAsset())
            .should.be.eventually.fulfilled
            .then(function(id) {
                assetId = id;
                createdAssetsIds.push(assetId);

                return corbelDriver.assets.asset(assetId).get()
                .should.be.eventually.fulfilled;
            }).then(function(response) {
                expect(response).to.have.deep.property('data.id', assetId);
            })
            .should.notify(done);
        });

        it('permanent asset gets created', function(done) {
            var asset = corbelTest.common.assets.getAsset();
            asset.expire = null;
            var assetId;

            corbelDriver.assets.asset().create(asset)
            .should.be.eventually.fulfilled
            .then(function(id) {
                assetId = id;
                createdAssetsIds.push(assetId);

                return corbelDriver.assets.asset(assetId).get()
                .should.be.eventually.fulfilled;
            }).then(function(response) {
                expect(response).to.have.deep.property('data.id', assetId);
            })
            .should.notify(done);
        });

        it('assets get created, they contain submitted data and identical', function(done) {
            var assetId1, assetId2;
            var asset = corbelTest.common.assets.getAsset();

            corbelDriver.assets.asset().create(asset)
            .should.be.eventually.fulfilled
            .then(function(id) {
                assetId1 = id;
                createdAssetsIds.push(assetId1);

                return corbelDriver.assets.asset(id).get()
                .should.be.eventually.fulfilled;
            }).then(function(response) {
                expect(response).to.have.deep.property('data.name', asset.name);
                expect(response).to.have.deep.property('data.productId', asset.productId);
                expect(response).to.have.deep.property('data.expire', asset.expire);
                expect(response).to.have.deep.property('data.active', asset.active);
                expect(response).to.have.deep.property('data.scopes')
                .that.is.deep.equals(asset.scopes);

                return corbelDriver.assets.asset().create(asset)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                assetId2 = id;
                createdAssetsIds.push(assetId2);

                return corbelDriver.assets.asset(id).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', assetId1);
                expect(response).to.have.deep.property('data.name', asset.name);
                expect(response).to.have.deep.property('data.productId', asset.productId);
                expect(response).to.have.deep.property('data.expire', asset.expire);
                expect(response).to.have.deep.property('data.active', asset.active);
                expect(assetId2).to.be.equals(assetId1);
            })
            .should.notify(done);
        });

        it('assets are created for a certain user and product using a different name', function(done) {
            var asset = corbelTest.common.assets.getAsset();
            var asset2 = corbelTest.common.assets.getAsset();
            asset2.name = 'createAssetTest2';
            asset2.active = false;
            asset2.scopes = ['assets:asset'];
            var assetId1, assetId2;

            corbelDriver.assets.asset().create(asset)
            .should.be.eventually.fulfilled
            .then(function(id) {
                assetId1 = id;
                createdAssetsIds.push(assetId1);

                return corbelDriver.assets.asset(id).get()
                .should.be.eventually.fulfilled;
            }).then(function(response) {
                expect(response).to.have.deep.property('data.id', assetId1);

                return corbelDriver.assets.asset().create(asset2)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                assetId2 = id;
                createdAssetsIds.push(assetId1);

                return corbelDriver.assets.asset(id).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id').that.is.not.equals(assetId1);
            })
            .should.notify(done);
        });
    });
});
