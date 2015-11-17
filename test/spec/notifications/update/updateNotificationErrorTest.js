describe('In NOTIFICATIONS module', function() {

    describe('when testing update notification templates', function() {
        var unauthorizedDriver;
        var corbelDriver;

        before(function() {
            unauthorizedDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        it('an error is returned while trying to update a notification template without permission', function(done) {

            unauthorizedDriver.notifications.notification('id')
                .update({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to update a non existent notification template', function(done) {

            corbelDriver.notifications.notification('non-existent')
                .update({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to update notification template with invalid data', function(done) {
            var notificationId;

            corbelTest.common.notifications.createNotification(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function(id) {
                notificationId = id;

                return corbelDriver.notifications.notification(notificationId)
                    .update('invalid')
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');

                return corbelDriver.notifications.notification(notificationId)
                    .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to update notification template with empty json', function(done) {
            var notificationId;

            corbelTest.common.notifications.createNotification(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function(id) {
                notificationId = id;

                return corbelDriver.notifications.notification(notificationId)
                    .update({})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');

                return corbelDriver.notifications.notification(notificationId)
                    .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
