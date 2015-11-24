describe('In RESOURCES module, in TERRA rem', function() {

    describe.skip('while testing complete subscription flow', function() {
        var corbelDriver;
        var TERRA_PINCOLLECTION = 'books:ChilePin';
        var TERRA_COLLECTION = 'books:ChileSubscription';
        var pinNumber = '0000';
        var mobileNumbers = [
              56992283703,
              56989223009,
              56993224809,
              56991900237,
              56988545655,
              56994309295,
              56982775431,
              56983581819,
              56983579120,
              56988440375,
              56958806825,
              56990238605,
              56974414786,
              56968085043,
              56958806510,
              56990235816,
              56974412120,
              56968067306,
              56958805771,
              56953417475,
              56953430551,
              56953420649
            ];

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });

        mobileNumbers.forEach(function(mobileNumber){
            it('a subscription can be created, checked and deleted for ' + mobileNumber, function(done) {
                corbelDriver.resources.resource(TERRA_COLLECTION, mobileNumber)
                    .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    if (response.data.subscribe) {
                        return corbelDriver.resources.resource(TERRA_PINCOLLECTION, mobileNumber)
                        .update()
                        .should.be.eventually.fulfilled
                        .then(function() {
                            return corbelDriver.resources.resource(TERRA_COLLECTION, mobileNumber)
                            .delete({customQueryParams: {pin: pinNumber}})
                            .should.be.eventually.fulfilled;
                        });
                    }
                })
                .then(function(){
                    return corbelDriver.resources.resource(TERRA_COLLECTION, mobileNumber)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.subscribe', false);

                    return corbelDriver.resources.resource(TERRA_PINCOLLECTION, mobileNumber)
                    .update()
                    .should.be.eventually.fulfilled;
                })
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
                    .should.be.eventually.fulfilled;
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
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.subscribe', false);
                })
                .should.notify(done);
            });
        });
    });
});
