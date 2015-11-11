describe('In RESOURCES module, in TERRA rem', function() {

    describe('while testing complete subscription flow', function() {
        var corbelDriver;
        var TERRA_PINCOLLECTION = 'books:ChilePin';
        var TERRA_COLLECTION = 'books:ChileSubscription';
        var pinNumber = '0000';
        var mobileNumbers = [
              56992283703,
              56989223009,
              56988545655,
              56994309295,
              56982775431
            ];

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });

        mobileNumbers.forEach(function(mobileNumber){
            it.skip('a subscription can be created, checked and deleted for ' + mobileNumber, function(done) {

                corbelDriver.resources.resource(TERRA_PINCOLLECTION, mobileNumber)
                .update()
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.property('status', 200);

                    return corbelDriver.resources.resource(TERRA_COLLECTION, mobileNumber)
                    .get()
                    .should.be.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.subscribe', false);
                })
                .then(function() {
                    return corbelDriver.resources.resource(TERRA_COLLECTION, mobileNumber)
                    .update(null, {customQueryParams: {pin: pinNumber}})
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.resource(TERRA_COLLECTION, mobileNumber)
                    .get()
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.subscribe', true);
                })
                .then(function(){
                    return corbelDriver.resources.resource(TERRA_COLLECTION, mobileNumber)
                    .delete({customQueryParams: {pin: pinNumber}})
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.resource(TERRA_COLLECTION, mobileNumber)
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
});
