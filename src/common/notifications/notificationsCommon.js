// @exclude
'use strict'
/*globals corbel */
// @endexclude

function createMultipleNotifications (driver, amount) {
  var promises = []
  for (var count = 1; count < amount; count++) {
    var promise = createNotification(driver, count)
      .should.be.eventually.fulfilled
    promises.push(promise)
  }
  return Promise.all(promises)
}

function createNotification (driver, number) {
  return driver.notifications.template().create(getRandomNotification(number))
}

function getRandomNotification (number) {
  number = number || 0
  return {
    id: 'mail_notification_' + number + '_' + Date.now(),
    type: 'mail',
    sender: 'me',
    text: 'text',
    title: 'subject'
  }
}

function deleteNotificationsList (driver, notificationList) {
  var promises = []
  notificationList.forEach(function (id) {
    var promise = driver.notifications.template(id)
      .delete()
      .should.be.eventually.fulfilled
      .then(function () {
        return driver.notifications.template(id)
          .get()
          .should.be.eventually.rejected
      })
      .then(function (e) {
        expect(e).to.have.property('status', 404)
        expect(e).to.have.deep.property('data.error', 'not_found')
      })
    promises.push(promise)
  })
  return Promise.all(promises)
}

module.exports = {
  createMultipleNotifications: createMultipleNotifications,
  createNotification: createNotification,
  getRandomNotification: getRandomNotification,
  deleteNotificationsList: deleteNotificationsList
}
