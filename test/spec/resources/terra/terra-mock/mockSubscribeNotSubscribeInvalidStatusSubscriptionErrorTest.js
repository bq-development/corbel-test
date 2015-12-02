describe('In RESOURCES module, in TERRA MOCK, testing create subscription', function() {
    var corbelDriver;

    var TERRA_COLLECTION = 'books:ChileSubscription';
    var TERRA_MOCK_COLLECTION = 'books:TerraMock';

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    describe('from whatever status', function() {

        it('[UNDER_DEVELOPMENT] [403] is returned while trying to subscribe with non existing number', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, '56989')
            .update(null, {customQueryParams: {pin: '1236'}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'unknown_error');
            })
            .should.notify(done);
        });
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

        it('403 is returned while trying to subscribe with not valid pin and its state isnt changed', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, UNSUBSCRIBED_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: '1'}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'invalid_pin');

                return corbelDriver.resources.resource(TERRA_COLLECTION, UNSUBSCRIBED_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, UNSUBSCRIBED_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscriptionState', 'NOT_SUBSCRIBED');
            })
            .should.notify(done);
        });

        it('an error [403] is returned while trying to subscribe with not requested pin number', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: UNSUBSCRIBED_NOT_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'pin_required');
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

        it('an error is returned while trying to subscribe and the number is already subscribed', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, SUBSCRIBED_REQUESTED_PIN_NUMBER.id)
            .get()
            .should.eventually.be.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', true);

                return corbelDriver.resources.resource(TERRA_COLLECTION, SUBSCRIBED_REQUESTED_PIN_NUMBER.id)
                .update(null, {customQueryParams: {pin: SUBSCRIBED_REQUESTED_PIN_NUMBER.pin}})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'already_subscribed');
            })
            .then(function(){
                return corbelDriver.resources.resource(TERRA_COLLECTION, SUBSCRIBED_REQUESTED_PIN_NUMBER.id)
                .delete({customQueryParams: {pin: SUBSCRIBED_REQUESTED_PIN_NUMBER.pin}})
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.resources.resource(TERRA_COLLECTION, SUBSCRIBED_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);
            })
            .should.notify(done);
        });
    });

    describe('[UNDER_DEVELOPMENT] from invalid status', function() {

        var INVALID_REQUESTED_PIN_NUMBER = {
            id: 999888772,
            pin: '1235',
            pinRequested: true,
            subscriptionState: 'INVALID'
        };

        var INVALID_NOT_REQUESTED_PIN_NUMBER = {
            id: 999888752,
            pin: '1235',
            pinRequested: false,
            subscriptionState: 'INVALID'
        };

        before(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, INVALID_REQUESTED_PIN_NUMBER.id)
            .update(INVALID_REQUESTED_PIN_NUMBER)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, INVALID_NOT_REQUESTED_PIN_NUMBER.id)
                .update(INVALID_NOT_REQUESTED_PIN_NUMBER)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, INVALID_REQUESTED_PIN_NUMBER.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, INVALID_NOT_REQUESTED_PIN_NUMBER.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('[403] is returned while trying to subscribe a invalid number with pin requested', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, INVALID_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: INVALID_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'invalid_number');

                return corbelDriver.resources.resource(TERRA_COLLECTION, INVALID_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, INVALID_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscriptionState', 'INVALID');
            })
            .should.notify(done);
        });

        it('[403] is returned while trying to subscribe a invalid number with not requested pin', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, INVALID_NOT_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: INVALID_NOT_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'invalid_number');

                return corbelDriver.resources.resource(TERRA_COLLECTION, INVALID_NOT_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, INVALID_NOT_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscriptionState', 'INVALID');
            })
            .should.notify(done);
        });
    });
});
