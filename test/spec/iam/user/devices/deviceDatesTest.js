describe('In IAM module', function () {
  describe('while testing creation and update dates in devices', function () {
    var user
    var corbelDriver
    var device

    before(function (done) {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()

      corbelTest.common.iam.createUsers(corbelDriver, 1)
        .should.be.eventually.fulfilled
        .then(function (createdUsers) {
          user = createdUsers[0]

          return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    beforeEach(function () {
      device = {
        notificationUri: Date.now(),
        uid: Date.now(),
        name: 'device',
        type: 'Android',
        notificationEnabled: true
      }
    })

    after(function (done) {
      corbelDriver.iam.user('me')
        .delete()
        .should.be.eventually.fulfilled
        .should.notify(done)
    })

    var expectDeviceCreationAndUpdateTimeNearToDateNow = function (device) {
      var baseTime = Date.now()
      var start = baseTime - 1000 * 30
      var finish = baseTime + 1000 * 30
      expect(device._updatedAt).within(start, finish)
      expect(device._createdAt).within(start, finish)
    }

    it('users can register his devices using user(me) and the device has _updateAt and _createdAt', function (done) {
      corbelDriver.iam.user('me')
        .registerDevice(device)
        .should.be.eventually.fulfilled
        .then(function (deviceId) {
          return corbelDriver.iam.user('me')
            .getDevice(deviceId)
            .should.be.eventually.fulfilled
        })
        .then(function (responseDevice) {
          device = responseDevice.data
          expectDeviceCreationAndUpdateTimeNearToDateNow(device)
          expect(device._updatedAt).to.be.equals(device._createdAt)
        })
        .should.notify(done)
    })

    it('users can register his devices using user(me) and when update it, _updateAt change', function (done) {
      corbelDriver.iam.user('me')
        .registerDevice(device)
        .should.be.eventually.fulfilled
        .then(function (deviceId) {
          return corbelDriver.iam.user('me')
            .getDevice(deviceId)
            .should.be.eventually.fulfilled
        })
        .then(function (responseDevice) {
          device = responseDevice.data
          expectDeviceCreationAndUpdateTimeNearToDateNow(device)
          expect(device._updatedAt).to.be.equals(device._createdAt)
          return corbelDriver.iam.user('me')
            .registerDevice(device)
            .should.be.eventually.fulfilled
        })
        .then(function (deviceId) {
          return corbelDriver.iam.user('me')
            .getDevice(deviceId)
            .should.be.eventually.fulfilled
        })
        .then(function (responseDevice) {
          device = responseDevice.data
          expectDeviceCreationAndUpdateTimeNearToDateNow(device)
          expect(device._updatedAt).to.be.above(device._createdAt)
        })
        .should.notify(done)
    })

    it('users can register his device with _updateAt and _createdAt using user(me), ' +
    'but server ignore user _updateAt and _createAt',
      function (done) {
        device._updatedAt = 1
        device._createdAt = 1
        corbelDriver.iam.user('me')
          .registerDevice(device)
          .should.be.eventually.fulfilled
          .then(function (deviceId) {
            return corbelDriver.iam.user('me')
              .getDevice(deviceId)
              .should.be.eventually.fulfilled
          })
          .then(function (responseDevice) {
            device = responseDevice.data
            expectDeviceCreationAndUpdateTimeNearToDateNow(device)
            expect(device._updatedAt).to.be.equals(device._createdAt)
          })
          .should.notify(done)
      })
  })
})
