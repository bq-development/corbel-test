describe('In RESOURCES module', function() {

    describe('while testing domain formation in URL', function() {
        var corbelDriver;
        var url = corbelTest.CONFIG.COMMON.urlBase;

        before(function() {
          corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it.only('domain appears in URL', function(done) {
            corbelDriver.iam.token()
            .create()
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.contain('');
            })
            .should.notify(done);
        });

        it('untenticated appears if the domain has not been assigned', function(done) {

        });
    });
});
