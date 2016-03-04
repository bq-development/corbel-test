describe('In NOTIFICATIONS module', function() {

    describe('when testing update notification templates', function() {
        var corbelDriver;
        var nameData;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        beforeEach(function(done) {
            nameData = 'notificationName-' + Date.now();
            corbelTest.common.notifications.createNotification(corbelDriver, nameData)
            .should.be.eventually.fulfilled
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.notifications.template(nameData)
                .delete()
            .should.be.eventually.fulfilled
            .should.notify(done);
        });

        it('the type field in notification templates can be updated', function(done) {
            corbelDriver.notifications.template(nameData)
                .update({type: 'sms'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
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
            corbelDriver.notifications.template(nameData)
                .update({text: 'updated text'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
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
            corbelDriver.notifications.template(nameData)
                .update({sender: 'you'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
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

            corbelDriver.notifications.template(nameData)
                .update({id: random})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
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

        it('the title field in notification templates can be updated', function(done) {
            corbelDriver.notifications.template(nameData)
                .update({title: 'updated title'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
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

        it('if the title field in notification templates is set to null, it is not updated', function(done) {
            corbelDriver.notifications.template(nameData)
                .update({title: null})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.sender');
                expect(response).to.have.deep.property('data.type');
            })
            .should.notify(done);
        });

        it('if the text field in notification templates is set to null, it is not updated', function(done) {
            corbelDriver.notifications.template(nameData)
                .update({text: null})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.sender');
                expect(response).to.have.deep.property('data.type');
            })
            .should.notify(done);
        });

        it('if the sender field in notification templates is set to null, it is not updated', function(done) {
            corbelDriver.notifications.template(nameData)
                .update({sender: null})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.sender');
                expect(response).to.have.deep.property('data.type');
            })
            .should.notify(done);
        });

        it('if the type field in notification templates is set to null, it is not updated', function(done) {
            corbelDriver.notifications.template(nameData)
                .update({type: null})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.title');
                expect(response).to.have.deep.property('data.id');
                expect(response).to.have.deep.property('data.text');
                expect(response).to.have.deep.property('data.sender');
                expect(response).to.have.deep.property('data.type');
            })
            .should.notify(done);
        });

        it('if the id field in notification templates is set to null, it is not updated', function(done) {
            corbelDriver.notifications.template(nameData)
                .update({id: null})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.title');
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

            corbelDriver.notifications.template(nameData)
                .update(updatedNotification)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.notifications.template(nameData)
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
