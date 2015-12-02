describe('In RESOURCES module, in TERRA MOCK, testing canceling subscription', function() {
    var corbelDriver;

    var TERRA_COLLECTION = 'books:ChileSubscription';
    var TERRA_MOCK_COLLECTION = 'books:TerraMock';

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    describe('from NOT_SUBSCRIBED status', function() {

        var UNSUBSCRIBED_REQUESTED_PIN_NUMBER = {
            id: 999888776,
            pin: '1236',
            pinRequested: true,
            subscriptionState: 'NOT_SUBSCRIBED'
        };

        var UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER = {
            id: 999888778,
            pin: '1235',
            pinRequested: false,
            subscriptionState: 'NOT_SUBSCRIBED'
        };

        before(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, UNSUBSCRIBED_REQUESTED_PIN_NUMBER.id)
            .update(UNSUBSCRIBED_REQUESTED_PIN_NUMBER)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER.id)
                .update(UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, UNSUBSCRIBED_REQUESTED_PIN_NUMBER.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('an error [404] is returned while trying to unsubscribe an unsubscribed number', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, UNSUBSCRIBED_REQUESTED_PIN_NUMBER.id)
            .delete({customQueryParams: {pin: UNSUBSCRIBED_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
            })
            .should.notify(done);
        });
    });

    describe('from SUBSCRIBED status', function() {

        var SUBSCRIBED_REQUESTED_PIN_NUMBER = {
            id: 999888771,
            pin: '1235',
            pinRequested: true,
            subscriptionState: 'SUBSCRIBED'
        };

        before(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, SUBSCRIBED_REQUESTED_PIN_NUMBER.id)
            .update(SUBSCRIBED_REQUESTED_PIN_NUMBER)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, SUBSCRIBED_REQUESTED_PIN_NUMBER.id)
            .delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [403] is returned while trying to unsubscribe with not valid pin', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, SUBSCRIBED_REQUESTED_PIN_NUMBER.id)
            .get()
            .should.eventually.be.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', true);
            })
            .then(function() {
                return corbelDriver.resources.resource(TERRA_COLLECTION, SUBSCRIBED_REQUESTED_PIN_NUMBER.id)
                .delete({customQueryParams: {pin: '11'}})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'invalid_pin');
            })
            .then(function(){
                return corbelDriver.resources.resource(TERRA_COLLECTION, SUBSCRIBED_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', true);
            })
            .should.notify(done);
        });
    });
});
