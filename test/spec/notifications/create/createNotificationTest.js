describe('In NOTIFICATIONS module', function() {

    describe('when testing creation', function() {
        var corbelDriver;
        var notificationId;
        var notificationData;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        beforeEach(function() {
            notificationData  = corbelTest.common.notifications.getRandomNotification();
        });

        afterEach(function(done) {
            corbelDriver.notifications.notification(notificationId)
                .delete()
            .should.be.eventually.fulfilled
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

        it('a notification template can be created and the id is received', function(done) {
            corbelDriver.notifications.notification()
                .create(notificationData)
            .should.be.eventually.fulfilled
            .then(function(id) {
                notificationId = id;

                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.property('data').and.to.contain(notificationData);
            })
            .should.notify(done);
        });
    });
});
