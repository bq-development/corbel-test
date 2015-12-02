describe('In RESOURCES module, in TERRA MOCK, testing create subscription', function() {
    var corbelDriver;

    var TERRA_COLLECTION = 'books:ChileSubscription';
    var TERRA_MOCK_COLLECTION = 'books:TerraMock';

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    describe('from blacklisted status', function() {

        var BLACKLISTED_REQUESTED_PIN_NUMBER = {
            id: 999888731,
            pin: '1235',
            pinRequested: true,
            subscriptionState: 'BLACKLISTED'
        };

        var BLACKLISTED_NOT_REQUESTED_PIN_NUMBER = {
            id: 999888732,
            pin: '1235',
            pinRequested: false,
            subscriptionState: 'BLACKLISTED'
        };

        before(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, BLACKLISTED_REQUESTED_PIN_NUMBER.id)
            .update(BLACKLISTED_REQUESTED_PIN_NUMBER)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, BLACKLISTED_NOT_REQUESTED_PIN_NUMBER.id)
                .update(BLACKLISTED_NOT_REQUESTED_PIN_NUMBER)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, BLACKLISTED_REQUESTED_PIN_NUMBER.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, BLACKLISTED_NOT_REQUESTED_PIN_NUMBER.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('[403] is returned while trying to subscribe a invalid number with pin requested', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, BLACKLISTED_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: BLACKLISTED_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'blacklist_number');

                return corbelDriver.resources.resource(TERRA_COLLECTION, BLACKLISTED_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, BLACKLISTED_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscriptionState', 'BLACKLISTED');
            })
            .should.notify(done);
        });

        it('[403] is returned while trying to subscribe a invalid number with not requested pin', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, BLACKLISTED_NOT_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: BLACKLISTED_NOT_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'blacklist_number');

                return corbelDriver.resources.resource(TERRA_COLLECTION, BLACKLISTED_NOT_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, BLACKLISTED_NOT_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscriptionState', 'BLACKLISTED');
            })
            .should.notify(done);
        });
    });

    describe('from in_process status', function() {

        var IN_PROCESS_REQUESTED_PIN_NUMBER = {
            id: 999888733,
            pin: '1235',
            pinRequested: true,
            subscriptionState: 'IN_PROCESS'
        };

        var IN_PROCESS_NOT_REQUESTED_PIN_NUMBER = {
            id: 999888734,
            pin: '1235',
            pinRequested: false,
            subscriptionState: 'IN_PROCESS'
        };

        before(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, IN_PROCESS_REQUESTED_PIN_NUMBER.id)
            .update(IN_PROCESS_REQUESTED_PIN_NUMBER)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, IN_PROCESS_NOT_REQUESTED_PIN_NUMBER.id)
                .update(IN_PROCESS_NOT_REQUESTED_PIN_NUMBER)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, IN_PROCESS_REQUESTED_PIN_NUMBER.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, IN_PROCESS_NOT_REQUESTED_PIN_NUMBER.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('[403] is returned trying to subscribe suscription in process number with requested pin', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, IN_PROCESS_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: IN_PROCESS_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'processing_subscription');

                return corbelDriver.resources.resource(TERRA_COLLECTION, IN_PROCESS_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, IN_PROCESS_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscriptionState', 'IN_PROCESS');
            })
            .should.notify(done);
        });

        it('[403] returned trying to subscribe a suscription in process number with not requested pin', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, IN_PROCESS_NOT_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: IN_PROCESS_NOT_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'processing_subscription');

                return corbelDriver.resources.resource(TERRA_COLLECTION, IN_PROCESS_NOT_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, IN_PROCESS_NOT_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscriptionState', 'IN_PROCESS');
            })
            .should.notify(done);
        });
    });

    describe('from renovating status', function() {

        var RENOVATING_REQUESTED_PIN_NUMBER = {
            id: 999888735,
            pin: '1235',
            pinRequested: true,
            subscriptionState: 'RENOVATING'
        };

        var RENOVATING_NOT_REQUESTED_PIN_NUMBER = {
            id: 999888736,
            pin: '1235',
            pinRequested: false,
            subscriptionState: 'RENOVATING'
        };

        before(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, RENOVATING_REQUESTED_PIN_NUMBER.id)
            .update(RENOVATING_REQUESTED_PIN_NUMBER)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, RENOVATING_NOT_REQUESTED_PIN_NUMBER.id)
                .update(RENOVATING_NOT_REQUESTED_PIN_NUMBER)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, RENOVATING_REQUESTED_PIN_NUMBER.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, RENOVATING_NOT_REQUESTED_PIN_NUMBER.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('[403] is returned trying to subscribe a renovation in process number with requested pin', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, RENOVATING_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: RENOVATING_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'processing_renovation');

                return corbelDriver.resources.resource(TERRA_COLLECTION, RENOVATING_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, RENOVATING_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscriptionState', 'RENOVATING');
            })
            .should.notify(done);
        });

        it('[403] returned trying to subscribe a renovation in process number with not requested pin', function(done) {
            corbelDriver.resources.resource(TERRA_COLLECTION, RENOVATING_NOT_REQUESTED_PIN_NUMBER.id)
            .update(null, {customQueryParams: {pin: RENOVATING_NOT_REQUESTED_PIN_NUMBER.pin}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'processing_renovation');

                return corbelDriver.resources.resource(TERRA_COLLECTION, RENOVATING_NOT_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);

                return corbelDriver.resources.resource(TERRA_MOCK_COLLECTION, RENOVATING_NOT_REQUESTED_PIN_NUMBER.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscriptionState', 'RENOVATING');
            })
            .should.notify(done);
        });
    });
});
