describe('In RESOURCES module', function () {
  describe('In SURVEY module', function () {
    var corbelDriver
    var email
    var questionTemplateId1
    var questionTemplateId2
    var orderIdentifier
    var questionId1
    var questionId2
    var answerId
    var surveyId
    var TEST_SURVEY
    var TEST_QUESTION1 = {
      description: 'This is the {{test}}',
      title: 'This is the {{test}}',
      sku: 'abc123'
    }

    var TEST_QUESTION2 = {
      description: 'Evaluate {{test}}',
      title: 'Evaluate {{test}}',
      sku: 'qwe098'
    }

    var testAnswerSurvey = {
      surveyId: surveyId,
      generalRating: 5,
      satisfaction: 'good',
      questions: [
        {
          id: questionId1,
          rating: 3
        },
        {
          id: questionId2,
          rating: 4,
          answer: 'I love it!'
        }
      ]
    }

    before(function (done) {
      corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone()

      corbelDriver.resources.collection('bquiz:Question')
        .add(TEST_QUESTION1)
        .should.be.eventually.fulfilled
        .then(function (id) {
          questionTemplateId1 = id

          return corbelDriver.resources.collection('bquiz:Question')
            .add(TEST_QUESTION2)
            .should.be.eventually.fulfilled
        })
        .then(function (id) {
          questionTemplateId2 = id
        })
        .should.notify(done)
    })

    beforeEach(function () {
      orderIdentifier = 'order-' + Date.now()
      email = 'SurveyTest-' + Date.now()
      TEST_SURVEY = {
        email: email,
        delay: 'P0D',
        questionsRequest: [
          {
            id: questionTemplateId1,
            metadata: {
              'test': 'test question'
            }
          },
          {
            id: questionTemplateId2,
            metadata: {
              'test': 'the product'
            }
          }
        ],
        language: 'es-ES',
        orderId: orderIdentifier,
        username: 'Batman'
      }
    })

    afterEach(function (done) {
      corbelDriver.resources.resource('bquiz:Answer', answerId)
        .delete()
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.resources.resource('bquiz:Answer', answerId)
            .get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')

          return corbelDriver.resources.resource('bquiz:Contact', email)
            .delete()
            .should.be.eventually.fulfilled
        })
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

    it('questions can be added to a survey and answered', function (done) {
      corbelDriver.resources.collection('bquiz:Survey')
        .add(TEST_SURVEY)
        .should.be.eventually.fulfilled
        .then(function (id) {
          surveyId = id
          testAnswerSurvey.surveyId = id

          return corbelDriver.resources.resource('bquiz:Survey', surveyId)
            .get()
            .should.be.eventually.fulfilled
        })
        .then(function (survey) {
          expect(survey).to.have.deep.property('data.questions[0].description', 'This is the test question')
          expect(survey).to.have.deep.property('data.questions[0].title', 'This is the test question')
          expect(survey).to.have.deep.property('data.questions[0].sku', 'abc123')
          questionId1 = survey.data.questions[0].id
          testAnswerSurvey.questions[0].id = questionId1

          expect(survey).to.have.deep.property('data.questions[1].description', 'Evaluate the product')
          expect(survey).to.have.deep.property('data.questions[1].title', 'Evaluate the product')
          expect(survey).to.have.deep.property('data.questions[1].sku', 'qwe098')
          questionId2 = survey.data.questions[1].id
          testAnswerSurvey.questions[1].id = questionId2

          expect(survey).to.have.deep.property('data.language', 'es-ES')
          expect(survey).to.have.deep.property('data.domain', 'silkroad-qa')

          return corbelDriver.resources.collection('bquiz:Answer')
            .add(testAnswerSurvey)
            .should.be.eventually.fulfilled
        })
        .then(function (id) {
          answerId = id

          return corbelDriver.resources.resource('bquiz:Answer', answerId)
            .get()
            .should.be.eventually.fulfilled
        })
        .then(function (answer) {
          expect(answer).to.have.deep.property('data.questions[0].id', questionId1)
          expect(answer).to.have.deep.property('data.questions[0].description', 'This is the test question')
          expect(answer).to.have.deep.property('data.questions[0].title', 'This is the test question')
          expect(answer).to.have.deep.property('data.questions[0].rating', 3)

          expect(answer).to.have.deep.property('data.questions[1].id', questionId2)
          expect(answer).to.have.deep.property('data.questions[1].description', 'Evaluate the product')
          expect(answer).to.have.deep.property('data.questions[1].title', 'Evaluate the product')
          expect(answer).to.have.deep.property('data.questions[1].rating', 4)
          expect(answer).to.have.deep.property('data.questions[1].answer', 'I love it!')

          expect(answer).to.have.deep.property('data.generalRating', 5)
          expect(answer).to.have.deep.property('data.satisfaction', 'good')
          expect(answer).to.have.deep.property('data.orderId', orderIdentifier)
          expect(answer).to.have.deep.property('data.domain', 'silkroad-qa')
        })
        .should.notify(done)
    })

    it('a survey is deleted when the questions are answered', function (done) {
      corbelDriver.resources.collection('bquiz:Survey')
        .add(TEST_SURVEY)
        .should.be.eventually.fulfilled
        .then(function (id) {
          surveyId = id
          testAnswerSurvey.surveyId = id

          return corbelDriver.resources.resource('bquiz:Survey', surveyId)
            .get()
            .should.be.eventually.fulfilled
        })
        .then(function (survey) {
          questionId1 = survey.data.questions[0].id
          testAnswerSurvey.questions[0].id = questionId1

          questionId2 = survey.data.questions[1].id
          testAnswerSurvey.questions[1].id = questionId2

          return corbelDriver.resources.collection('bquiz:Answer')
            .add(testAnswerSurvey)
            .should.be.eventually.fulfilled
        })
        .then(function (id) {
          answerId = id

          return corbelDriver.resources.resource('bquiz:Survey', surveyId)
            .get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })
  })
})
