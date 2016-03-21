describe('In ASSETS module', function() {
    describe('when getting an asset', function() {

        describe('while using an admin user', function() {
            var corbelDriver;

            before(function(){
                corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            });

            it('filtered assets are retrieved when queryParams filters by scope', function(done) {
                corbelDriver.assets.asset().getAll({
                    query: [{
                        '$in': {
                            'scopes': ['assets:asset']
                        }
                    }]
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    response.data.every(function(object) {
                        return object.scopes === 'assets:test';
                    });
                })
                .should.notify(done);
            });

        });
    });
});
