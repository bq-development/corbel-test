describe('In RESOURCES module', function () {
  describe('In SURVEY module', function () {
    describe('questions can be added and then a response survey is created and sended', function () {
      var MAX_RETRY = 28
      var RETRY_PERIOD = 3
      var corbelDriver
      var questionTemplateId
      var email
      var emailAuthorization
      var orderIdentifier
      var clientUrl = 'bquiz-client.com.s3-website-eu-west-1.amazonaws.com'

      var TEST_QUESTION = {
        description: 'This is the {{test}}',
        title: 'This is the {{test}}',
        sku: 'abc123'
      }

      before(function (done) {
        corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone()

        corbelDriver.resources.collection('bquiz:Question')
          .add(TEST_QUESTION)
          .should.be.eventually.fulfilled
          .then(function (id) {
            questionTemplateId = id
          })
          .should.notify(done)
      })

      beforeEach(function (done) {
        orderIdentifier = 'order-' + Date.now()

        corbelTest.common.mail.random.getRandomMail()
          .should.be.eventually.fulfilled
          .then(function (response) {
            email = response.emailData.email_addr
            emailAuthorization = response.cookies.PHPSESSID
          })
          .should.notify(done)
      })

      afterEach(function (done) {
        corbelDriver.resources.resource('bquiz:Contact', email)
          .delete()
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelDriver.resources.resource('bquiz:Contact', email)
              .get()
              .should.be.eventually.rejected
          })
          .then(function (e) {
            expect(e).to.have.property('status', 404)
            expect(e).to.have.deep.property('data.error', 'not_found')
          })
          .should.notify(done)
      })

      it('in Spanish', function (done) {
        var TEST_SURVEY = {
          email: email,
          delay: 'P0D',
          questionsRequest: [
            {
              id: questionTemplateId,
              metadata: {
                'test': 'test question'
              }
            },
            {
              id: questionTemplateId,
              metadata: {
                'test': 'test2 question'
              }
            }
          ],
          language: 'es-ES',
          orderId: orderIdentifier,
          username: 'Batman'
        }

        corbelDriver.resources.collection('bquiz:Survey')
          .add(TEST_SURVEY)
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelDriver.resources.resource('bquiz:Contact', email)
              .get()
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.contact', true)
            expect(response).to.have.deep.property('data.id', email)

            return corbelTest.common.utils.retry(function () {
              return corbelTest.common.mail.random.checkMail(emailAuthorization)
                .then(function (response) {
                  if (response.emailList.list.length === 0) {
                    return Promise.reject()
                  } else {
                    return response
                  }
                })
            }, MAX_RETRY, RETRY_PERIOD)
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            emailAuthorization = response.cookies.PHPSESSID
            var emailId = response.emailList.list[0].mail_id

            return corbelTest.common.mail.random.getMail(emailAuthorization, emailId)
              .should.be.eventually.fulfilled
          })
          .then(function (mail) {
            expect(mail).to.have.deep.property('mail_subject').and.to.contain('Valora bq.')
            expect(mail).to.have.deep.property('mail_body').and.to.contain(clientUrl)
          })
          .should.notify(done)
      })

      it('in French', function (done) {
        var TEST_SURVEY = {
          email: email,
          delay: 'P0D',
          questionsRequest: [
            {
              id: questionTemplateId,
              metadata: {
                'test': 'test question'
              }
            },
            {
              id: questionTemplateId,
              metadata: {
                'test': 'test2 question'
              }
            }
          ],
          language: 'fr-FR',
          orderId: orderIdentifier,
          username: 'Vincent'
        }

        corbelDriver.resources.collection('bquiz:Survey')
          .add(TEST_SURVEY)
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelDriver.resources.resource('bquiz:Contact', email)
              .get()
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.contact', true)
            expect(response).to.have.deep.property('data.id', email)

            return corbelTest.common.utils.retry(function () {
              return corbelTest.common.mail.random.checkMail(emailAuthorization)
                .then(function (response) {
                  if (response.emailList.list.length === 0) {
                    return Promise.reject()
                  } else {
                    return response
                  }
                })
            }, MAX_RETRY, RETRY_PERIOD)
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            emailAuthorization = response.cookies.PHPSESSID
            var emailId = response.emailList.list[0].mail_id

            return corbelTest.common.mail.random.getMail(emailAuthorization, emailId)
              .should.be.eventually.fulfilled
          })
          .then(function (mail) {
            expect(mail).to.have.deep.property('mail_subject')
              .and.to.contain('votre avis compte !')
            expect(mail).to.have.deep.property('mail_body').and.to.contain(clientUrl)
          })
          .should.notify(done)
      })

      it('in Portuguese', function (done) {
        var TEST_SURVEY = {
          email: email,
          delay: 'P0D',
          questionsRequest: [
            {
              id: questionTemplateId,
              metadata: {
                'test': 'test question'
              }
            },
            {
              id: questionTemplateId,
              metadata: {
                'test': 'test2 question'
              }
            }
          ],
          language: 'pt-PT',
          orderId: orderIdentifier,
          username: 'Bruno'
        }

        corbelDriver.resources.collection('bquiz:Survey')
          .add(TEST_SURVEY)
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelDriver.resources.resource('bquiz:Contact', email)
              .get()
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.contact', true)
            expect(response).to.have.deep.property('data.id', email)

            return corbelTest.common.utils.retry(function () {
              return corbelTest.common.mail.random.checkMail(emailAuthorization)
                .then(function (response) {
                  if (response.emailList.list.length === 0) {
                    return Promise.reject()
                  } else {
                    return response
                  }
                })
            }, MAX_RETRY, RETRY_PERIOD)
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            emailAuthorization = response.cookies.PHPSESSID
            var emailId = response.emailList.list[0].mail_id

            return corbelTest.common.mail.random.getMail(emailAuthorization, emailId)
              .should.be.eventually.fulfilled
          })
          .then(function (mail) {
            expect(mail).to.have.deep.property('mail_subject')
              .and.to.contain('Avalie a bq')
            expect(mail).to.have.deep.property('mail_body').and.to.contain(clientUrl)
          })
          .should.notify(done)
      })
    })
  })
})
