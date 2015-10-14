describe('In RESOURCES module, in TERRA rem', function() {

    describe('while testing create subscription', function() {
        var corbelDriver;
        var TERRA_COLLECTION = 'books:ChileSubscription';
        var wrongMobileNumber = '56983078754';
        var rightMobileNumber = '56989223009';
        var rightPinNumber = '0000';
        var wrongPinNumber = '1111';

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'];
        });

        it('an error [403] is returned while trying to subscribe with not valid number', function(done) {

            corbelDriver.resources.resource(TERRA_COLLECTION, wrongMobileNumber)
            .update(null, {customQueryParams: {pin: rightPinNumber}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'forbidden');
            })
            .should.notify(done);
        });

        it.skip('an error [403] is returned while trying to subscribe with not valid pin', function(done) {

            corbelDriver.resources.resource(TERRA_COLLECTION, rightMobileNumber)
            .update(null, {customQueryParams: {pin: wrongPinNumber}})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'forbidden');
            })
            .should.notify(done);
        });

        it.skip('an error is returned while trying to subscribe and the number is already subscribed', function(done) {

            corbelDriver.resources.resource(TERRA_COLLECTION, rightMobileNumber)
            .update(null, {customQueryParams: {pin: rightPinNumber}})
            .should.be.eventually.fulfilled
            .then(function(){
                return corbelDriver.resources.resource(TERRA_COLLECTION, rightMobileNumber)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', true);

                return corbelDriver.resources.resource(TERRA_COLLECTION, rightMobileNumber)
                .update(null, {customQueryParams: {pin: rightPinNumber}})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'forbidden');
            })
            .then(function(){
                return corbelDriver.resources.resource(TERRA_COLLECTION, rightMobileNumber)
                .delete({customQueryParams: {pin: rightPinNumber}})
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.resources.resource(TERRA_COLLECTION, rightMobileNumber)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);
            })
            .should.notify(done);
        });
    });
});
