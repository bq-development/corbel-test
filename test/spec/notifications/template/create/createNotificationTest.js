describe('In NOTIFICATIONS module', function() {

    describe('when testing creation', function() {
        var corbelDriver;
        var notificationData;
        var notificationDataResponse;
        var nameData;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        beforeEach(function() {
            nameData = 'notificationName-' + Date.now();
            notificationData  = corbelTest.common.notifications.getNotification(nameData);
            notificationDataResponse = corbelTest.common.notifications.getNotificationResponse(nameData);
        });

        afterEach(function(done) {
            corbelDriver.notifications.template(nameData)
                .delete()
            .should.be.eventually.fulfilled
            .should.notify(done);
        });

        it('a notification template can be created and the id is received', function(done) {
            corbelDriver.notifications.template()
                .create(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.property('data').and.to.contain(notificationDataResponse);
            })
            .should.notify(done);
        });

       it('a notification template can be created without title and the id is received', function(done) {
            delete notificationData.title;

            corbelDriver.notifications.template()
                .create(notificationData)
            .should.be.eventually.fulfilled
            .then(function() {

                return corbelDriver.notifications.template(nameData)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                delete notificationDataResponse.title;
                expect(response).to.have.property('data').and.to.contain(notificationDataResponse);
            })
            .should.notify(done);
        });
    });
});
