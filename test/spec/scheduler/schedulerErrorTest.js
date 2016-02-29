describe('In SCHEDULER module', function () {
  var corbelDriver
  var corbelUnauthorizedDriver
  var taskId, task

  before(function () {
    corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone()
    corbelUnauthorizedDriver = corbelTest.drivers['DEFAULT_USER'].clone()
  })

  it('an error is returned when trying to create a new absolute task whithout propper permissions', function (done) {
    taskId = 'scheduler:TestAbsoluteScheduler:' + Date.now()
    task = {
      'taskId': taskId,
      'taskDefinition': {
        'message': 'message'
      },
      'moment': '00:01'
    }

    corbelUnauthorizedDriver.scheduler.task().create(task)
      .should.be.eventually.rejected
      .then(function (e) {
        expect(e).to.have.property('status', 401)
        expect(e).to.have.deep.property('data.error', 'invalid_token')
      })
      .should.notify(done)
  })

  it('an error is returned when trying to create a new relative task whithout propper permissions', function (done) {
    taskId = 'scheduler:TestRelativeScheduler:' + Date.now()
    task = {
      'taskId': taskId,
      'delay': 'P0D',
      'period': 'PT72H',
      'taskDefinition': {
        'message': 'message'
      }
    }

    corbelUnauthorizedDriver.scheduler.task().create(task)
      .should.be.eventually.rejected
      .then(function (e) {
        expect(e).to.have.property('status', 401)
        expect(e).to.have.deep.property('data.error', 'invalid_token')
      })
      .should.notify(done)
  })

  describe('when a task is scheduled', function () {
    before(function (done) {
      taskId = 'scheduler:TestTaskScheduler:' + Date.now()
      task = {
        'taskId': taskId,
        'taskDefinition': {
          'message': 'message'
        },
        'moment': '00:01'
      }
      corbelDriver.scheduler.task().create(task)
        .should.be.eventually.fulfilled.and.notify(done)
    })

    after(function (done) {
      corbelDriver.scheduler.task(taskId).delete()
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.scheduler.task(taskId).get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })

    it('an error [404] is returned when trying to retrieve a nonexistent task', function (done) {
      corbelDriver.scheduler.task('nonExistent:id').get()
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })

    it('an error [401] is returned when trying to retrieve a task without propper permissions', function (done) {
      corbelUnauthorizedDriver.scheduler.task(taskId).get()
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'invalid_token')
        })
        .should.notify(done)
    })

    it('an error [400] is returned when trying to reschedule a nonexistent task', function (done) {
      var params = {
        'moment': '23:30'
      }

      corbelDriver.scheduler.task('nonExistent:id').update(params)
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 400)
          expect(e).to.have.deep.property('data.error', 'bad_request')
        })
        .should.notify(done)
    })

    it('an error [401] is returned when trying to reschedule a task without propper permissions', function (done) {
      var params = {
        'moment': '23:30'
      }

      corbelUnauthorizedDriver.scheduler.task(taskId).update(params)
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'invalid_token')
        })
        .should.notify(done)
    })

    it('a DELETE request over a non-existent task can be performed although it has no effect', function (done) {
      corbelDriver.scheduler.task('nonExistent:id').delete()
        .should.be.eventually.fulfilled.and.notify(done)
    })

    it('an error [401] is returned when trying to delete a task without propper permissions', function (done) {
      corbelUnauthorizedDriver.scheduler.task(taskId).delete()
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 401)
          expect(e).to.have.deep.property('data.error', 'invalid_token')
        })
        .should.notify(done)
    })
  })
})
