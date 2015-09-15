describe('In ASSETS module, testing createAsset', function() {
    var corbelDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
    });

    it('should success returning CREATED(201) when an admin requests to create an asset', function(done) {
        var assetId;

        corbelDriver.assets().create(corbelTest.common.assets.getAsset())
        .should.be.eventually.fulfilled
        .then(function(id) {
            assetId = id;

            return corbelDriver.assets(assetId).get()
            .should.be.eventually.fulfilled;
        }).then(function(response) {
            expect(response.data).to.have.property('id', assetId);

            return corbelDriver.assets(assetId).delete()
            .should.be.eventually.fulfilled;
        })
        .should.be.eventually.fulfilled.and.notify(done);
    });

    it('should success returning CREATED(201) when an admin requests to create a permanent asset', function(done) {
        var asset = corbelTest.common.assets.getAsset();
        asset.expire = null;
        var assetId;

        corbelDriver.assets().create(asset)
        .should.be.eventually.fulfilled
        .then(function(id) {
            assetId = id;

            return corbelDriver.assets(assetId).get()
            .should.be.eventually.fulfilled;
        }).then(function(response) {
            expect(response.data).to.have.property('id', assetId);

            return corbelDriver.assets(assetId).delete()
            .should.be.eventually.fulfilled;
        })
        .should.be.eventually.fulfilled.and.notify(done);
    });

    it('should success returning created assets when an admin requests to ' +
    'create an existing asset (assets has user, product and name id generator)', function(done) {
        var assetId1, assetId2;
        var asset = corbelTest.common.assets.getAsset();

        corbelDriver.assets().create(asset)
        .should.be.eventually.fulfilled
        .then(function(id) {
            assetId1 = id;

            return corbelDriver.assets(id).get()
            .should.be.eventually.fulfilled;
        }).then(function(response) {
            expect(response.data).to.have.property('name', asset.name);
            expect(response.data).to.have.property('productId', asset.productId);
            expect(response.data).to.have.property('expire', asset.expire);
            expect(response.data).to.have.property('active', asset.active);
            expect(response.data).to.have.property('scopes')
            .that.is.deep.equals(asset.scopes);

            return corbelDriver.assets().create(asset)
            .should.be.eventually.fulfilled;
        })
        .then(function(id) {
            assetId2 = id;

            return corbelDriver.assets(id).get()
            .should.be.eventually.fulfilled;
        })
        .then(function(response) {
            expect(response.data).to.have.property('id', assetId1);
            expect(response.data).to.have.property('name', asset.name);
            expect(response.data).to.have.property('productId', asset.productId);
            expect(response.data).to.have.property('expire', asset.expire);
            expect(response.data).to.have.property('active', asset.active);
            expect(assetId2).to.be.equals(assetId1);

            return corbelDriver.assets(assetId1).delete()
            .should.be.eventually.fulfilled;
        })
        .should.be.eventually.fulfilled.and.notify(done);
    });

    it('should success returning created assets when an admin requests to create ' +
    'some assets for the same user and same product but different name ', function(done) {
        var asset = corbelTest.common.assets.getAsset();
        var asset2 = corbelTest.common.assets.getAsset();
        asset2.name = 'createAssetTest2';
        asset2.active = false;
        asset2.scopes = ['assets:asset'];
        var assetId1, assetId2;

        corbelDriver.assets().create(asset)
        .should.be.eventually.fulfilled
        .then(function(id) {
            assetId1 = id;

            return corbelDriver.assets(id).get()
            .should.be.eventually.fulfilled;
        }).then(function(response) {
            expect(response.data).to.have.property('id', assetId1);

            return corbelDriver.assets().create(asset2)
            .should.be.eventually.fulfilled;
        })
        .then(function(id) {
            assetId2 = id;

            return corbelDriver.assets(id).get()
            .should.be.eventually.fulfilled;
        })
        .then(function(response) {
            expect(response.data).to.have.property('id').that.is.not.equals(assetId1);

            return corbelDriver.assets(assetId1).delete()
            .should.be.eventually.fulfilled;
        })
        .then(function() {
            return corbelDriver.assets(assetId2).delete()
            .should.be.eventually.fulfilled;
        })
        .should.be.eventually.fulfilled.and.notify(done);
    });
});
