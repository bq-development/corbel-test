describe('In SCHEDULER module', function() {
    var corbelAdminDriver;
    var taskId, task;

    before(function() {
      corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
    });

    describe('when testing creation without errors', function() {

        afterEach(function(done) {
            corbelAdminDriver.scheduler.task(taskId).delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.scheduler.task(taskId).get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('a new absolute task is created with date', function(done){
            taskId = 'scheduler:TestAbsoluteScheduler:' + Date.now();
            task = {
                'taskId':taskId,
                'taskDefinition': {
                    'message': 'message'
                },
                'moment':'2017-12-03T10:15:30'
            };

            corbelAdminDriver.scheduler.task().create(task)
            .should.be.eventually.fulfilled
            .then(function(id) {
                expect(id).to.be.equals(taskId);
            })
            .should.notify(done);
        });

        it('a new absolute task is created without date', function(done){
            taskId = 'scheduler:TestAbsoluteScheduler:' + Date.now();
            task = {
                'taskId':taskId,
                'taskDefinition': {
                    'message': 'message'
                },
                'moment':'00:01'
            };

            corbelAdminDriver.scheduler.task().create(task)
            .should.be.eventually.fulfilled
            .then(function(id) {
                expect(id).to.be.equals(taskId);
            }).should.notify(done);
        });
    });

    describe('when testing deletion without errors', function() {

      beforeEach(function(done) {
        taskId = 'scheduler:TestAbsoluteScheduler:' + Date.now();
        task = {
            'taskId':taskId,
            'taskDefinition': {
                'message': 'message'
            },
            'moment':'00:01'
        };

        corbelAdminDriver.scheduler.task().create(task)
        .should.be.eventually.fulfilled
        .then(function(id) {
            expect(id).to.be.equals(taskId);
        }).should.notify(done);
      });

      it('a new absolute task is deleted', function(done){
        corbelAdminDriver.scheduler.task(taskId).delete()
        .should.be.eventually.fulfilled
        .then(function() {
            return corbelAdminDriver.scheduler.task(taskId).get()
            .should.be.eventually.rejected;
        })
        .then(function(e) {
            expect(e).to.have.property('status', 404);
            expect(e).to.have.deep.property('data.error', 'not_found');
        })
        .should.notify(done);
      });
    });

    describe('when a new absolute task is scheduled', function(){

        before(function(done) {
            taskId = 'scheduler:TestAbsoluteScheduler:' + Date.now();
            task = {
                'taskId':taskId,
                'taskDefinition': {
                    'message': 'message'
                },
                'moment':'00:01'
            };

            corbelAdminDriver.scheduler.task().create(task)
            .should.be.eventually.fulfilled
            .then(function(id) {
                expect(id).to.be.equals(taskId);
            }).should.notify(done);
        });

        it('resulting task can be retrieved', function(done) {
            corbelAdminDriver.scheduler.task(taskId).get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.taskId', taskId);
                expect(response).to.not.have.deep.property('data.period');
            })
            .should.notify(done);
        });

        it('the task can be rescheduled', function(done) {
            var originalNextExecutionValue;
            var params = {
                'moment':'23:30'
            };

            corbelAdminDriver.scheduler.task(taskId).get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                originalNextExecutionValue = response.data.nextExecution;
                expect(response).to.have.deep.property('data.taskId', taskId);
                return corbelAdminDriver.scheduler.task(taskId).update(params)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelAdminDriver.scheduler.task(taskId).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.not.have.deep.property('data.period');
                expect(response).to.have.deep.property('data.nextExecution').not.equals(originalNextExecutionValue);
            })
            .should.notify(done);
        });

        it('the task can be deleted', function(done) {
            corbelAdminDriver.scheduler.task(taskId).delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.scheduler.task(taskId).get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });

    it('a new relative task is created and deleted', function(done){
        taskId = 'scheduler:TestRelativeScheduler:' + Date.now();
        task = {
            'taskId':taskId,
            'delay':'P0D',
            'period':'PT72H',
            'taskDefinition': {
                'message': 'message'
            },
        };

        corbelAdminDriver.scheduler.task().create(task)
        .should.be.eventually.fulfilled
        .then(function(id){
          expect(id).to.be.equals(taskId);
            return corbelAdminDriver.scheduler.task(taskId).delete()
            .should.be.eventually.fulfilled;
        })
        .then(function() {
            return corbelAdminDriver.scheduler.task(taskId).get()
            .should.be.eventually.rejected;
        })
        .then(function(e) {
            expect(e).to.have.property('status', 404);
            expect(e).to.have.deep.property('data.error', 'not_found');
        })
        .should.notify(done);
    });

    describe('when a new relative task is scheduled', function(){

        before(function(done) {
            taskId = 'scheduler:TestRelativeScheduler:' + Date.now();
            task = {
                'taskId':taskId,
                'delay':'P0D',
                'period':'PT72H',
                'taskDefinition': {
                    'message': 'message'
                },
            };

            corbelAdminDriver.scheduler.task().create(task)
            .should.be.eventually.fulfilled
            .then(function(id) {
                expect(id).to.be.equals(taskId);
            }).should.notify(done);
        });

        it('resulting task can be retrieved', function(done) {
            corbelAdminDriver.scheduler.task(taskId).get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.taskId', taskId);
                expect(response).to.have.deep.property('data.period', task.period);
            })
            .should.notify(done);
        });

        it('the task can be rescheduled', function(done) {

            var originalNextExecutionValue;
            var params = {
                'delay':'P0D',
                'period':'PT48H'
            };

            corbelAdminDriver.scheduler.task(taskId).get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.taskId', taskId);
                return corbelAdminDriver.scheduler.task(taskId).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(data) {
                originalNextExecutionValue = data.nextExecution;
                return corbelAdminDriver.scheduler.task(taskId).update(params)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelAdminDriver.scheduler.task(taskId).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.period', params.period);
            })
            .should.notify(done);
        });

        it('the task can be deleted', function(done) {

            corbelAdminDriver.scheduler.task(taskId).delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.scheduler.task(taskId).get()
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
