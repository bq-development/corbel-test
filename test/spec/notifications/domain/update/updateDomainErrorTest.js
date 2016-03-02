describe('In NOTIFICATIONS module', function() {

    describe('when testing update notification domains', function() {
        var unauthorizedDriver;
        var corbelDriver;

        before(function() {
            unauthorizedDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        it('an error is returned while trying to update a notification domain without permission', function(done) {

            unauthorizedDriver.notifications.domain()
                .update({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to update a non existent notification template', function(done) {

            var testDriver;
            var clientScopes = ['notifications:admin']; 
            var domainId = 'domain-crudDomainTest-' + Date.now();
            var domainIdCreated = 'silkroad-qa:' + domainId;
            var clientName = 'client-crudDomainTest-' + Date.now();
            var corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            
            corbelTest.common.iam.createDomainAndClient(corbelRootDriver, domainId, clientName, clientScopes)
            .then(function(clientInfo) {
                testDriver = corbelTest.getCustomDriver({
                    'clientId': clientInfo.id,
                    'clientSecret': clientInfo.key,
                    'scopes': clientScopes.join(' ')
                });

                return testDriver.notifications.domain()
                .update({}).should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });


        it('an error [422] is returned if the data is not a json', function(done) {
            corbelDriver.notifications.domain()
                .update('invalid')
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });
    });
});
