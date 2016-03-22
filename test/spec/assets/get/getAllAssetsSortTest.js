describe('In ASSETS module', function() {
    describe('when getting an asset', function() {

        describe('while using an admin user', function() {
            var corbelDriver;

            before(function(){
                corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            });

            it('assets are retrieved sorted upwardly', function(done) {
                corbelDriver.assets.asset().getAll({
                    sort: {
                        'name': 'asc'
                    }
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'name')).
                    to.be.equal(true);
                })
                .should.notify(done);
            });

            it('assets are retrieved sorted downwardly', function(done) {
                corbelDriver.assets.asset().getAll({
                    sort: {
                        'name': 'desc'
                    }
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'name')).
                    to.be.equal(true);
                })
                .should.notify(done);
            });
        });
    });
});
