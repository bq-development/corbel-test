describe('In NOTIFICATIONS module', function() {

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

        it('the type field in notification templates can be updated', function(done) {
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
                expect(response).to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.sender');
            })
            .should.notify(done);
        });

        it('the text field in notification templates can be updated', function(done) {
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
                expect(response).to.have.deep.property('data.type');
                expect(response).to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.sender');
            })
            .should.notify(done);
        });

        it('the sender field in notification templates can be updated', function(done) {
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
                expect(response).to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.type');
            })
            .should.notify(done);
        });

        it('the id field in notification templates can not be updated', function(done) {
            var random = Date.now();

            corbelDriver.notifications.notification(notificationId)
                .update({id: random})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id').and.not.to.be.equal(random);
                expect(response).to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.sender');
                expect(response).to.have.deep.property('data.type');
            })
            .should.notify(done);
        });

        it('the id field in notification templates can not be removed', function(done) {
            corbelDriver.notifications.notification(notificationId)
                .update({id: null})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.sender');
                expect(response).to.have.deep.property('data.type');
            })
            .should.notify(done);
        });

        it('the title field in notification templates can be updated', function(done) {
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
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.sender');
                expect(response).to.have.deep.property('data.type');
            })
            .should.notify(done);
        });

        it('the title field in notification templates can be removed', function(done) {
            corbelDriver.notifications.notification(notificationId)
                .update({title: null})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.notification(notificationId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).not.to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.sender');
                expect(response).to.have.deep.property('data.type');
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
