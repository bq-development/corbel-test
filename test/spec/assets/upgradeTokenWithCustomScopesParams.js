describe('In ASSETS module', function() {
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

    before(function() {
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

    describe('When admin try to create an asset with ', function() {

        it('missing custom parameters, fail, return bad request 400', function(done) {
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
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('wrong custom parameters to user, fail, return bad request 400', function(done) {
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
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('correctly custom parameters and wrong custom parameters to user, fail', function(done) {
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
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

    });

    describe('when admin create an asset with correctly custom parameters to user', function() {

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


        it('token upgrade works correctly', function(done) {
            userCorbelDriver.assets().access()
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });

    describe('when an admin creates an asset with correct custom parameters to user,'+
    ' repeating a scope with diferent param value', function() {

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

        it('token upgrade works correctly', function(done) {
            userCorbelDriver.assets().access().should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
