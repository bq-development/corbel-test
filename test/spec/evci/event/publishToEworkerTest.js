describe('In EVCI module', function() {
    var corbelDriver;

    before(function() {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    it('a resource should be created/put after an event is sent to the proper worker', function(done) {
        var MAX_RETRY = 30;
        var RETRY_PERIOD = 2;

        var eventType = 'test:Event';
        var event = {
            id: Date.now() + '-id',
            timestamp: Date.now(),
            message: 'hello evci'
        };

        corbelDriver.evci.event(eventType)
            .publish(event)
        .should.be.eventually.fulfilled
        .then(function() {
            return corbelTest.common.utils.retry(function() {
                return corbelDriver.resources.resource(eventType, event.id)
                .get()
                .should.be.eventually.fulfilled;
            }, MAX_RETRY, RETRY_PERIOD)
            .should.be.eventually.fulfilled;
        })
        .then(function(response) {
            expect(response).to.have.deep.property('data.id', event.id);
            expect(response).to.have.deep.property('data.timestamp', event.timestamp);
            expect(response).to.have.deep.property('data.message', event.message);
        })
        .should.notify(done);    
    });           
});
