describe('In EVCI module', function() {

    var corbelDriver;
    
    before(function() {
        var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;
        var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
        corbelDriver = corbelTest.getCustomDriver(prodIamUser);
    });

    describe('when sending ClientLog', function() {
        it('[SANITY] success with ACCEPTED (202)', function(done) {
            corbelDriver.evci.event('log.ClientLog').publish({
                client: {
                    client: 'SilkRoad-Tests'
                },
                logs: [{
                    level: 'INFO',
                    timestamp: Date.now(),
                    message: 'Production tests'
                }]
            })
            .should.be.eventually.fulfilled.and.notify(done); 
        });
    });
});