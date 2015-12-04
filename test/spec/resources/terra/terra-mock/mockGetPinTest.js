describe('In RESOURCES module, in TERRA MOCK', function() {

    describe('while testing get Pin for Terra subscription', function() {
        var corbelDriver;

        var TERRA_PINCOLLECTION = 'books:ChilePin';
        var TERRA_MOCK_COLLECTION = 'books:TerraMock';

        var wrongMobileNumber = '56989';

        var UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER = {
          id: 999888741,
          pin: '1236',
          pinRequested: false,
          subscriptionState: 'NOT_SUBSCRIBED'
        };

        var UNSUBSCRIBED_REQUESTED_PIN_NUMBER = {
          id: 999888742,
          pin: '1236',
          pinRequested: true,
          subscriptionState: 'NOT_SUBSCRIBED'
        };

        var BLACKLISTED_NOT_REQUESTED_PIN_NUMBER = {
          id: 999888743,
          pin: '1236',
          pinRequested: false,
          subscriptionState: 'BLACKLISTED'
        };

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER.id)
            .update(UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, UNSUBSCRIBED_REQUESTED_PIN_NUMBER.id)
                .update(UNSUBSCRIBED_REQUESTED_PIN_NUMBER)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, BLACKLISTED_NOT_REQUESTED_PIN_NUMBER.id)
                .update(BLACKLISTED_NOT_REQUESTED_PIN_NUMBER)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, UNSUBSCRIBED_REQUESTED_PIN_NUMBER.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, BLACKLISTED_NOT_REQUESTED_PIN_NUMBER.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('a pin can be gotten', function(done) {
            corbelDriver.resources.resource(TERRA_PINCOLLECTION, UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER.id)
            .update()
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.property('status', 200); 
            })
            .should.notify(done);
        });

        it('an error [404] is returned while trying to get the pin with invalid number', function(done) {
            corbelDriver.resources.resource(TERRA_PINCOLLECTION, wrongMobileNumber)
            .update()
            .should.be.eventually.rejected
            .then(function(response){
                console.log('Response status '+response.status);
                expect(response).to.have.property('status', 404); 
            })
            .should.notify(done);
        });

        it('a pin can be gotten although it has been requested before', function(done) {
            corbelDriver.resources.resource(TERRA_PINCOLLECTION, UNSUBSCRIBED_REQUESTED_PIN_NUMBER.id)
            .update()
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.property('status', 200); 
            })
            .should.notify(done);
        });

        it('a pin can be gotten although the subscriptionState is different from unsubscribed', function(done) {
            corbelDriver.resources.resource(TERRA_PINCOLLECTION, BLACKLISTED_NOT_REQUESTED_PIN_NUMBER.id)
            .update()
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.property('status', 200); 
            })
            .should.notify(done);
        });
    });
});
