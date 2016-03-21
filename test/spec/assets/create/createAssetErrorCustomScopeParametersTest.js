describe('In ASSETS module', function() {
    describe('when setting wrong custom parameters', function() {
        var getAsset = corbelTest.common.assets.getAsset;
        var clientCorbelDriver;

        before(function() {
            clientCorbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });

        it('asset is not created when incomplete scope data is defined', function(done) {
            clientCorbelDriver.assets.asset().create(getAsset(['custom:test']))
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_formed_scope');
                })
                .should.notify(done);
        });

        it('asset is not created when wrong user scope data is defined', function(done) {
            clientCorbelDriver.assets.asset().create(getAsset(['custom:test;type=15;customId=1']))
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_formed_scope');
                })
                .should.notify(done);
        });

        it('asset is not created when custom scope data is correct but the user one', function(done) {
            clientCorbelDriver.assets.asset().create(getAsset(['custom:test;errorId;type=Custom;customId=1']))
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_formed_scope');
                })
                .should.notify(done);
        });

    });
});
