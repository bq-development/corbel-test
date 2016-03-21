describe('In WEBFS module', function() {
    var corbelDriver;

    beforeEach(function() {
        corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        corbelTest.common.utils.replaceUriForProxyUse(corbelDriver);
    });

    it('a resource can be retrieved with the same content-type as especified through webfs', function(done) {
        corbelDriver.webfs.webfs('index.html').get({
                Accept: 'text/html'
            })
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('headers.content-type').and.to.contain('text/html');
            })
            .should.notify(done);
    });

    it('a resource can be retrieved using the cookie', function(done) {
        var corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        corbelTest.common.utils.replaceUriForProxyUse(corbelDriver);
        corbelDriver.iam.token().create({
                    claims: {
                        'basic_auth.username': corbelDriver.config.get('username'),
                        'basic_auth.password': corbelDriver.config.get('password')
                    }
                },
                true).should.be.eventually.fulfilled
            .then(function() {
                return corbel.request.send({
                        url: corbelDriver.config.getCurrentEndpoint('webfs') + 'index.html',
                        withCredentials: true
                    })
                    .should.be.eventually.fulfilled;
            }).should.notify(done);
    });

    it('an error 404 is returned if the resorce does not exist in webfs', function(done) {
        corbelDriver.webfs.webfs('non existent').get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
    });
});