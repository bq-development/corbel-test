
describe('In NOTIFICATIONS module', function() {

    describe('when testing domain creation', function() {
        var corbelDriver;
        var unauthorizedDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            unauthorizedDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        });

        it('an error is returned while trying to create a notification template without permission', function(done) {
            var notificationDomainData = {
	            properties: {
	                prop1: 'propValue1'
	            },
	            templates: {
	                temp1: 'tempValue1'
	            }
	        };

            unauthorizedDriver.notifications.domain()
                .create(notificationDomainData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to create an empty domain', function(done) {

            corbelDriver.notifications.domain()
                .create({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to create a domain without properties', function(done) {
            var notificationDomainData = {
                templates: {
	                temp1: 'tempValue1'
	            }
            };

            corbelDriver.notifications.domain()
                .create(notificationDomainData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [422] is returned while trying to create a domain without templates', function(done) {
            var notificationDomainData = {
                properties: {
	                prop1: 'propValue1'
	            }
            };

            corbelDriver.notifications.domain()
                .create(notificationDomainData)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });
    });
});
