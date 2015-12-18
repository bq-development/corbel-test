describe('In RESOURCES module, in TERRA rem', function() {

    describe('while testing get Pin for Terra subscription', function() {
        var corbelDriver;
        var TERRA_PINCOLLECTION = 'books:ChilePin';
        var rightMobileNumber = '56989223009';
        var wrongMobileNumber = '56989';

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });

        it('a pin can be gotten', function(done) {

            corbelDriver.resources.resource(TERRA_PINCOLLECTION, rightMobileNumber)
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
                expect(response).to.have.property('status', 404);
                expect(response).to.have.deep.property('data.error', 'not_found'); 
            })
            .should.notify(done);
        });
    });
});
