describe('In ASSETS module', function() {
    describe('when creating assets with an admin user', function(){

        var user;
        var assetId;
        var clientCorbelDriver, userCorbelDriver;
        var testUserData = {
            id: 'fooid',
            username: 'foopurchases@foo.com',
            password: 'foopass',
            oauthService: 'silkroad',
            remember: false
        };

        beforeEach(function() {
            clientCorbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
            userCorbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        var expire = function() {
            return Date.now() + 100000;
        };

        var createAssetForUserAndLoginUser = function(driver, asset) {
            return corbelTest.common.iam.createUsers(clientCorbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(response) {
                user = response[0];
                asset.userId = user.id;
                return createAssetForUser(driver, asset)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                assetId = id;
                return corbelTest.common.clients.loginUser( clientCorbelDriver, user.username, user.password)
                .should.be.eventually.fulfilled;
            });
        };

        var createAssetForUser = function(driver, asset) {
            return userCorbelDriver.assets().create(asset)
            .should.be.eventually.fulfilled;
        };

        describe('when setting wrong custom parameters', function() {

            it('asset is not created when incomplete scope data is defined', function(done) {
                userCorbelDriver.assets().create({
                    userId: testUserData.id,
                    name: 'customAssetWithoutParams',
                    productId: 'customAssetWithoutParams',
                    expire: expire(),
                    active: true,
                    scopes: ['custom:test']
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_formed_scope');
                })
                .should.notify(done);
            });

            it('asset is not created when wrong user scope data is defined', function(done) {
                userCorbelDriver.assets().create({
                    userId: testUserData.id,
                    name: 'customAssetWithWrongParams',
                    productId: 'customAssetWithWrongParams',
                    expire: expire(),
                    active: true,
                    scopes: ['custom:test;type=15;customId=1']
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_formed_scope');
                })
                .should.notify(done);
            });

            it('asset is not created when custom scope data is correct but the user one', function(done) {
                userCorbelDriver.assets().create({
                    userId: testUserData.id,
                    name: 'customAssetWithCorrectlyAndWrongsParams',
                    productId: 'customAssetWithCorrectlyAndWrongsParams',
                    expire: expire(),
                    active: true,
                    scopes: ['custom:test;errorId;type=Custom;customId=1']
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_formed_scope');
                })
                .should.notify(done);
            });

        });

        describe('when setting correct custom parameters', function() {

            var asset = {
                name: 'customAssetWithCorrectlyParams',
                productId: 'customAssetWithCorrectlyParams',
                expire: expire(),
                active: true,
                scopes: ['custom:test;type=Custom;customId=1']
            };

            before(function(done) {
                createAssetForUserAndLoginUser( userCorbelDriver, asset)
                .should.notify(done);
            });

            after(function(done){
                clientCorbelDriver.iam.user(user.id).delete()
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('token upgrade works correctly', function(done) {
                userCorbelDriver.assets().access()
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });

        describe('when setting correct custom parameters and adding too similar assets to same user', function() {

            var user;

            before(function(done) {
                corbelTest.common.iam.createUsers(clientCorbelDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    user = response[0];
                    var asset = {
                        name: 'customAssetWithCorrectlyParams1',
                        productId: 'customAssetWithCorrectlyParams1',
                        expire: expire(),
                        active: true,
                        scopes: ['custom:test;type=Custom;customId=2']
                    };
                    asset.userId = user.id;
                    return createAssetForUser(userCorbelDriver, asset);
                })
                .then(function () {
                    return createAssetForUserAndLoginUser(userCorbelDriver, {
                        userId: user.id,
                        name: 'customAssetWithCorrectlyParams2',
                        productId: 'customAssetWithCorrectlyParams2',
                        expire: expire(),
                        active: true,
                        scopes: ['custom:test;type=Custom;customId=3']
                    });
                })
                .should.notify(done);
            });

            after(function(done){
                clientCorbelDriver.iam.user(user.id).delete()
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('token upgrade works correctly', function(done) {
                userCorbelDriver.assets().access()
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });
    });
});
