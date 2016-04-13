describe('In CORBELJS module', function() {

    describe('when checking delays between client-server communication', function(){
        
        var MAX_TIME_DELTA = 60 * 10;
        var corbelDriver;

        before(function() {
          corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('is in time check passes when maxDelay value is among limits', function(done){
            var maxDelay = MAX_TIME_DELTA * 1000;

            corbel.utils.isInTime(corbelDriver, maxDelay)
            .then(function(delay){
                expect(delay).to.be.below(maxDelay);
            })
            .should.notify(done);
        });

        it('is in time check fails when maxDelay accepted is too low', function(done){
            var maxDelay = 0.001;

            corbel.utils.isInTime(corbelDriver, maxDelay)
            .should.be.eventually.rejected.and.should.notify(done);
        });
    });
});