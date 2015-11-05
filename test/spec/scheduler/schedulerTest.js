describe('In SCHEDULER module', function() {
    var corbelDriver;
    var taskId, task;

    before(function() {
      corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
    });
            
    it('a new absolute task is created and deleted', function(done){
        taskId = 'scheduler:TestAbsoluteScheduler:' + Date.now();
        task = {
            'taskId':taskId,
            'taskDefinition': {
                'message': 'message' 
            },
            'moment':'00:01'
        };

        corbelDriver.scheduler.task().create(task)
        .should.be.eventually.fulfilled
        .then(function(){
            return corbelDriver.scheduler.task(taskId).delete()
            .should.be.eventually.fulfilled;
        })
        .then(function() {
            return corbelDriver.scheduler.task(taskId).get()
            .should.be.eventually.rejected;
        })
        .then(function(e) {
            expect(e).to.have.property('status', 404);
            expect(e).to.have.deep.property('data.error', 'not_found');
        })
        .should.notify(done);
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

            corbelDriver.scheduler.task().create(task)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('resulting task can be retrieved', function(done) {
            corbelDriver.scheduler.task(taskId).get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.taskId', taskId);
                expect(response).to.have.deep.property('data.period', 'P1D');
            })
            .should.notify(done);
        });

        it('the task can be rescheduled', function(done) {

            var originalNextExecutionValue;
            var params = {
                'moment':'23:30'
            };

            corbelDriver.scheduler.task(taskId).get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                originalNextExecutionValue = response.data.nextExecution;
                expect(response).to.have.deep.property('data.taskId', taskId);
                return corbelDriver.scheduler.task(taskId).update(params)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.scheduler.task(taskId).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.period', 'P1D');
                expect(response).to.have.deep.property('data.nextExecution').not.equals(originalNextExecutionValue);

            })
            .should.notify(done);
        });

        it('the task can be deleted', function(done) {

            corbelDriver.scheduler.task(taskId).delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.scheduler.task(taskId).get()
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

        corbelDriver.scheduler.task().create(task)
        .should.be.eventually.fulfilled
        .then(function(){
            return corbelDriver.scheduler.task(taskId).delete()
            .should.be.eventually.fulfilled;
        })
        .then(function() {
            return corbelDriver.scheduler.task(taskId).get()
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

            corbelDriver.scheduler.task().create(task)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('resulting task can be retrieved', function(done) {
            corbelDriver.scheduler.task(taskId).get()
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

            corbelDriver.scheduler.task(taskId).get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.taskId', taskId);
                return corbelDriver.scheduler.task(taskId).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(data) {
                originalNextExecutionValue = data.nextExecution;
                return corbelDriver.scheduler.task(taskId).update(params)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.scheduler.task(taskId).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.period', params.period);
            })
            .should.notify(done);
        });

        it('the task can be deleted', function(done) {

            corbelDriver.scheduler.task(taskId).delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.scheduler.task(taskId).get()
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
