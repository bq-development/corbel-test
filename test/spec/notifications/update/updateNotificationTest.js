describe('in notification templates module', function() {

    describe('when testing update notification templates', function() {
        var corbelDriver;
        var notificationId;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        beforeEach(function(done) {
            corbelTest.common.notifications.createNotification(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function(id) {
                notificationId = id;
            })
            .should.notify(done);
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

        it('a type field in notification templates can be updated', function(done) {
            corbelDriver.notifications.notification(notificationId)
                .update({type: 'sms'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.type', 'sms');
            })
            .should.notify(done);
        });

        it('a text field in notification templates can be updated', function(done) {
            corbelDriver.notifications.notification(notificationId)
                .update({text: 'updated text'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.text', 'updated text');
            })
            .should.notify(done);
        });

        it('a sender field in notification templates can be updated', function(done) {
            corbelDriver.notifications.notification(notificationId)
                .update({sender: 'you'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.sender', 'you');
            })
            .should.notify(done);
        });

        it('a title field in notification templates can be updated', function(done) {
            corbelDriver.notifications.notification(notificationId)
                .update({title: 'updated title'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.title', 'updated title');
            })
            .should.notify(done);
        });

        it('several fields in notification templates can be updated', function(done) {
            var updatedNotification = {
                type: 'sms',
                sender: 'you',
                text: 'updated text',
                title: 'updated tittle'
            };

            corbelDriver.notifications.notification(notificationId)
                .update(updatedNotification)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.property('data').and.to.contain(updatedNotification);
            })
            .should.notify(done);
        });
    });
});
