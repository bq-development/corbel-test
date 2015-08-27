describe('In EVCI module', function() {
    var corbelDriver;

    before(function() {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    it('when send any valid event server replies with ACCEPTED (202)', function(done) {
        corbelDriver.evci.event('eventType').publish({
            newProp: 'new prop',
            newProp2: 1233
        })
        .should.be.eventually.fulfilled.and.notify(done); 
    });

    it('when sending an event with a malformed json fails with UNPROCESSABLE ENTITY (422)', function(done) {
        corbelDriver.evci.event('eventType').publish('Bad Content')
        .should.be.eventually.rejected
        .then(function(e) {
            expect(e).to.have.property('status', 422);
            expect(e).to.have.deep.property('data.error', 'invalid_entity');
        })
        .should.be.eventually.fulfilled.and.notify(done);
    });

    it('when send an event with an empty string fails with UNPROCESSABLE ENTITY (422)', function(done) {
        corbelDriver.evci.event('eventType').publish(' ')
        .should.be.eventually.rejected
        .then(function(e) {
            expect(e).to.have.property('status', 422);
            expect(e).to.have.deep.property('data.error', 'invalid_entity');
        })
        .should.be.eventually.fulfilled.and.notify(done);
    });
            
});