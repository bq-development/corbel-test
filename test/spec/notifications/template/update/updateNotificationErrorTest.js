describe('In NOTIFICATIONS module', function() {

    describe('when testing update notification templates', function() {
        var unauthorizedDriver;
        var corbelDriver;

        before(function() {
            unauthorizedDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        it('an error is returned while trying to update a notification template without permission', function(done) {

            unauthorizedDriver.notifications.template('id')
                .update({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to update a non existent notification template', function(done) {

            corbelDriver.notifications.template('non-existent')
                .update({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        describe('with wrong data', function() {
            var notificationId;

            beforeEach(function(done) {

                corbelTest.common.notifications.createNotification(corbelDriver)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    notificationId = id;
                })
                .should.notify(done);
            });

            afterEach(function(done) {

                corbelDriver.notifications.template(notificationId)
                    .delete()
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.notifications.template(notificationId)
                        .get()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });

            it('an error [422] is returned if the data is not a json', function(done) {

                corbelDriver.notifications.template(notificationId)
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
});
