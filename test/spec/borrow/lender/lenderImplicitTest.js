describe('In BORROW module, with the lender API as user', function() {

    var DOMAIN = 'silkroad-qa';
    var corbelDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    it('you can get your domain lender', function(done) {
        corbelDriver.borrow.lender().get().
        should.eventually.be.fulfilled.
        then(function(lender) {
            expect(lender).to.have.deep.property('data.id', DOMAIN);
        }).
        should.notify(done);
    });

    it('you can not modify it', function(done) {
        corbelDriver.borrow.lender().update({}).
        should.eventually.be.rejected.
        then(function(error) {
            expect(error).to.have.property('status', 401);

            return corbelDriver.borrow.lender().delete().
            should.eventually.be.rejected;
        }).
        then(function(error) {
            expect(error).to.have.property('status', 401);

            return corbelDriver.borrow.lender(DOMAIN).create({}).
            should.eventually.be.rejected;
        }).
        then(function(error) {
            expect(error).to.have.property('status', 401);
        }).
        should.notify(done);
    });

});
