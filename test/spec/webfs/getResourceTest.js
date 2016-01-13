describe('In WEBFS module', function() {
    var corbelDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        corbelTest.common.utils.replaceUriForProxyUse(corbelDriver, 'webfs');
    });

    it('a resource can be retrieved whit the same content-type as especified through webfs', function(done) {
        corbelDriver.webfs.webfs('index.html').get({Accept: 'text/xml'})
        .should.be.eventually.fulfilled
        .then(function(response){
            expect(response).to.have.deep.property('headers.content-type').and.to.contain('text/xml');
        })
        .should.notify(done);
    });

    it('an error 404 is returned if the resorce does not exist in webfs', function(done) {
        corbelDriver.webfs.webfs('non existent').get()
        .should.be.eventually.rejected
        .then(function(e){
          expect(e).to.have.property('status', 404);
          expect(e).to.have.deep.property('data.error', 'not_found');
        })
        .should.notify(done);
    });
});
