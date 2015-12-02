describe('In RESOURCES module, in TERRA MOCK', function() {

    describe('while testing complete subscription flow', function() {
        var corbelDriver;

        var TERRA_MOCK_COLLECTION = 'books:TerraMock';
        var TERRA_PINCOLLECTION = 'books:ChilePin';
        var TERRA_COLLECTION = 'books:ChileSubscription';

        var MOCKED_UNSUBSCRIBED_NUMBER = {
          id: 999888774,
          pin: '1236',
          pinRequested: false,
          subscriptionState: 'NOT_SUBSCRIBED'
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('a subscription can be created, checked and deleted', function(done) {
            // Add mock number
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, MOCKED_UNSUBSCRIBED_NUMBER.id)
            .update(MOCKED_UNSUBSCRIBED_NUMBER)
            .should.be.eventually.fulfilled
            .then(function(response){
                // Request pin
                return corbelDriver.resources.resource(TERRA_PINCOLLECTION, MOCKED_UNSUBSCRIBED_NUMBER.id)
                .update()
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                expect(response).to.have.property('status', 200);

                // Check number
                return corbelDriver.resources.resource(TERRA_COLLECTION, MOCKED_UNSUBSCRIBED_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                // Subscribe number
                return corbelDriver.resources.resource(TERRA_COLLECTION, MOCKED_UNSUBSCRIBED_NUMBER.id)
                .update(null, {customQueryParams: {pin: MOCKED_UNSUBSCRIBED_NUMBER.pin}})
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                // Check number
                return corbelDriver.resources.resource(TERRA_COLLECTION, MOCKED_UNSUBSCRIBED_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', true);

                // Remove subscription
                return corbelDriver.resources.resource(TERRA_COLLECTION, MOCKED_UNSUBSCRIBED_NUMBER.id)
                .delete({customQueryParams: {pin: MOCKED_UNSUBSCRIBED_NUMBER.pin}})
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.resources.resource(TERRA_COLLECTION, MOCKED_UNSUBSCRIBED_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
             })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                // Delete number
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, MOCKED_UNSUBSCRIBED_NUMBER.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });
    });
});
