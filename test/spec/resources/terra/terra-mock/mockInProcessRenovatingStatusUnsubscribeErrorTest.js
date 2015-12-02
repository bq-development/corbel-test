describe.only('In RESOURCES module, in TERRA MOCK,', function() {

    describe('while testing canceling subscription', function() {

        var corbelDriver;

        var TERRA_COLLECTION = 'books:ChileSubscription';
        var TERRA_MOCK_COLLECTION = 'books:TerraMock';

        var IN_PROCESS_REQUESTED_PIN_NUMBER = {
            id: 999888713,
            pin: '1235',
            pinRequested: true,
            subscriptionState: 'IN_PROCESS'
        };

        var RENOVATING_REQUESTED_PIN_NUMBER = {
            id: 999888714,
            pin: '1235',
            pinRequested: true,
            subscriptionState: 'RENOVATING'
        };

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, IN_PROCESS_REQUESTED_PIN_NUMBER.id)
            .update(IN_PROCESS_REQUESTED_PIN_NUMBER)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, RENOVATING_REQUESTED_PIN_NUMBER.id)
                .update(RENOVATING_REQUESTED_PIN_NUMBER)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, IN_PROCESS_REQUESTED_PIN_NUMBER.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, RENOVATING_REQUESTED_PIN_NUMBER.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('an error [404] is returned while trying to unsubscribe an subscription in process number', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, IN_PROCESS_REQUESTED_PIN_NUMBER.id)
            .delete({customQueryParams: {pin: IN_PROCESS_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
            })
            .should.notify(done);
        });

        it('an error [404] is returned while trying to unsubscribe an renovating subscription number', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, RENOVATING_REQUESTED_PIN_NUMBER.id)
            .delete({customQueryParams: {pin: RENOVATING_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
            })
            .should.notify(done);
        });
    });
});
