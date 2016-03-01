describe('In NOTIFICATIONS module', function() {

    describe('while getting notification templates', function() {
        var corbelDriver;
        var notificationList;

        before(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1);
            corbelTest.common.notifications.createMultipleNotifications(corbelDriver, 24)
            .should.be.eventually.fulfilled
            .then(function(createdList) {
                notificationList = createdList;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelTest.common.notifications.deleteNotificationsList(corbelDriver, notificationList)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('if there are not params, default number of notification templates are received', function(done) {
            corbelDriver.notifications.template()
                .get()
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', corbelTest.CONFIG.GLOBALS.defaultPageSize);
            })
            .should.notify(done);
        });

        it('if a page with size 5 is requested, five notification templates are received', function(done) {
            var params = {
                pagination: {
                    pageSize: 5
                }
            };

            corbelDriver.notifications.template()
                .get(params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', 5);
            })
            .should.notify(done);
        });

        it('if page 1 with size 10 is requested, ten notification templates are received', function(done) {
            var params = {
                pagination: {
                    page: 1,
                    pageSize: 10
                }
            };

            corbelDriver.notifications.template()
                .get(params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', 10);
            })
            .should.notify(done);
        });

        it('only notification templates that match the query are received', function(done) {
            var params = {
                query: [{
                    '$eq': {
                        id: notificationList[0]
                    }
                }]
            };

            corbelDriver.notifications.template()
                .get(params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', 1);
                expect(response).to.have.deep.property('data[0].id', notificationList[0]);
            })
            .should.notify(done);
        });

        it('no notification templates are received if the query is not matched', function(done) {
            var params = {
                query: [{
                    '$eq': {
                        id: 'nonexistent'
                    }
                }]
            };

            corbelDriver.notifications.template()
                .get(params)
            .should.be.eventually.fulfilled
            .then(function(response){
                expect(response).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });
    });
});
