describe('In RESOURCES module, in TERRA rem', function() {

    describe('while testing complete subscription flow', function() {
        var corbelDriver;
        var TERRA_COLLECTION = 'books:ChileSubscription';
        var rightMobileNumber = '56989223009';
        var rightPinNumber = '0000';

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'];
        });

        it('a subscription can be created, checked and deleted', function(done) {

            corbelDriver.resources.resource(TERRA_COLLECTION, rightMobileNumber)
            .get()
            .should.eventually.be.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', false);
            })
            .then(function() {
                return corbelDriver.resources.resource(TERRA_COLLECTION, rightMobileNumber)
                .update(null, {customQueryParams: {pin: rightPinNumber}})
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.resources.resource(TERRA_COLLECTION, rightMobileNumber)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.subscribe', true);
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
