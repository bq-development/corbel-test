describe('In corbel-test project', function() {
    var corbelDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    it('default driver has expected content', function() {
        var corbelTestConfig = corbelTest.CONFIG.DEFAULT_CLIENT;

        expect(corbelDriver).to.be.an('object');
        expect(corbelDriver).to.have.deep.property('assets').to.be.an('object');
        expect(corbelDriver).to.have.deep.property('borrow').to.be.an('object');
        expect(corbelDriver).to.have.deep.property('evci').to.be.an('object');
        expect(corbelDriver).to.have.deep.property('iam').to.be.an('object');
        expect(corbelDriver).to.have.deep.property('notifications').to.be.an('object');
        expect(corbelDriver).to.have.deep.property('oauth').to.be.an('object');
        expect(corbelDriver).to.have.deep.property('resources').to.be.an('object');
        expect(corbelDriver).to.have.deep.property('scheduler').to.be.an('object');
        expect(corbelDriver).to.have.deep.property('webfs').to.be.an('object');

        expect(corbelDriver).to.have.deep.property('config.config.clientId', corbelTestConfig.clientId);
        expect(corbelDriver).to.have.deep.property('config.config.clientSecret', corbelTestConfig.clientSecret);
        expect(corbelDriver).to.have.deep.property('config.config.domain', corbelTest.CONFIG.DOMAIN);

    });

    it('corbelTest exist and has expected members', function() {
        expect(corbelTest).to.be.an('object');
        expect(corbelTest).to.include.keys(['fixtures']);
    });

    it('can access to fixtures cards access', function() {
        expect(corbelTest.fixtures.cards.cards).to.be.an('array');
    });

    it('can login as a random user', function(done) {
        corbelTest.common.clients.loginAsRandomUser(corbelDriver)
            .should.be.eventually.fulfilled.and.notify(done);
    });

});
