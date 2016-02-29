describe('In OAUTH module', function () {
  describe('common reset password tests', function () {
    var MAX_RETRY = 10
    var RETRY_PERIOD = 2

    var corbelDriver
    var oauthCommonUtils
    var userTestParams

    before(function () {
      corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone()
      oauthCommonUtils = corbelTest.common.oauth
      userTestParams = oauthCommonUtils.getOauthUserTestParams()
    })

    it('reset password of an nonexistent user never fails', function (done) {
      var clientParams = {
        clientId: userTestParams.clientId,
        clientSecret: userTestParams.clientSecret
      }
      var email = 'randomEmail_' + Date.now() + '@nothing.net'

      corbelDriver.oauth
        .user(clientParams)
        .sendResetPasswordEmail(email)
        .should.be.eventually.fulfilled
        .should.notify(done)
    })

    it('email allows reset user account password with client sending once time token to change it ',
      function (done) {
        var userEmailData
        var oneTimeToken
        var clientParams = oauthCommonUtils.getClientParams()
        var oauthUserTest = {
          username: 'randomUser' + Date.now(),
          password: 'randomPassword' + Date.now()
        }

        corbelTest.common.mail
          .random.getRandomMail()
          .should.be.eventually.fulfilled
          .then(function (response) {
            userEmailData = response
            oauthUserTest.email = userEmailData.emailData['email_addr']

            return corbelDriver.oauth
              .user(clientParams)
              .create(oauthUserTest)
              .should.be.eventually.fulfilled
          })
          .then(function () {
            return corbelDriver.oauth
              .user(clientParams)
              .sendResetPasswordEmail(oauthUserTest.email)
              .should.be.eventually.fulfilled
          })
          .then(function () {
            return corbelTest.common.utils.retry(function () {
              return corbelTest.common.mail.random.checkMail(userEmailData.cookies.PHPSESSID)
                .then(function (response) {
                  if (response.emailList.list.length <= 1) {
                    return Promise.reject()
                  } else {
                    return response
                  }
                })
            }, MAX_RETRY, RETRY_PERIOD)
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            response.emailList.list.should.contain.an.thing.with
              .property('mail_subject', 'Reset your account password')

            var resetPasswordMail = {}
            response.emailList.list.forEach(function (email) {
              if (email['mail_subject'].toLowerCase() === 'reset your account password') {
                resetPasswordMail = email
              }
            })

            return corbelTest.common.mail.random
              .getMail(response.cookies.PHPSESSID, resetPasswordMail['mail_id'])
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            oneTimeToken = response['mail_body'].split('token=')[1]

            return corbelDriver.oauth
              .user(oauthCommonUtils.getClientParams(), oneTimeToken)
              .update('me', {password: oauthUserTest.password + oauthUserTest.password})
              .should.be.eventually.fulfilled
          })
          .then(function () {
            return corbelDriver.oauth
              .user(oauthCommonUtils.getClientParams(), oneTimeToken)
              .update('me', {
                password: oauthUserTest.password + oauthUserTest.password +
                  oauthUserTest.password
              })
              .should.be.eventually.rejected
          })
          .then(function () {
            return oauthCommonUtils
              .getToken(corbelDriver, oauthUserTest.username, oauthUserTest.password +
                oauthUserTest.password)
              .should.be.eventually.fulfilled
          })
          .should.notify(done)
      })
  })
})
