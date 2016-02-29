describe('In RESOURCES module', function () {
  describe('In I18N module', function () {
    var corbelDriver
    var I18N_COLLECTION = 'i18n:test' + Date.now()

    before(function () {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()
    })

    describe('when exists a key-value dictionary', function () {
      var dictionary = {
        es: {
          hello: 'Hola',
          bye: 'adios'
        },
        en: {
          hello: 'Hello',
          bye: 'goodbye'
        }
      }

      beforeEach(function (done) {
        var promise
        Object.keys(dictionary).forEach(function (language) {
          Object.keys(dictionary[language]).forEach(function (key) {
            promise = function () {
              return corbelDriver.resources.resource(I18N_COLLECTION, key)
                .update({
                  lang: language,
                  value: dictionary[language][key]
                })
                .should.be.eventually.fulfilled
            }
          })
        })
        Promise.resolve(promise)
          .should.be.eventually.fulfilled.and.notify(done)
      })

      it('that can be retrive like a collection with accept language header', function (done) {
        var params = {
          headers: {}
        }

        var promise
        var languages = Object.keys(dictionary)

        // Ex: Accept-Language : ,es;q=0.8,en
        Object.keys(dictionary).forEach(function (selectedLanguage) {
          promise = function () {
            var acceptLanguage = selectedLanguage
            var value = 0.8

            languages.filter(function (language) {
              return language !== selectedLanguage
            })
              .forEach(function (language) {
                acceptLanguage = ',' + language + ';q=' + value + ',' + acceptLanguage
                value -= 0.1
              })
            params.headers['Accept-Language'] = acceptLanguage

            return corbelDriver.resources.collection(I18N_COLLECTION)
              .get(params)
              .should.be.eventually.fulfilled
              .then(function (response) {
                expect(response).to.have.deep.property('data.length',
                  Object.keys(dictionary[selectedLanguage]).length)
                response.data.forEach(function (resource) {
                  expect(resource).to.have.property('value', dictionary[resource.lang][resource.key])
                })
              })
          }
        })
        Promise.resolve(promise)
          .should.be.eventually.fulfilled.and.notify(done)
      })

      it('that can be retrive a key:value like a resource with accept language header', function (done) {
        var params = {
          headers: {}
        }
        var promise

        Object.keys(dictionary).forEach(function (language) {
          Object.keys(dictionary[language]).forEach(function (key) {
            promise = function () {
              params.headers['Accept-Language'] = language

              return corbelDriver.resources.resource(I18N_COLLECTION, key)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function (response) {
                  expect(response).to.have.deep.property('data.value', dictionary[language][key])
                  expect(response).to.have.deep.property('data.lang', language)
                  expect(response).to.have.deep.property('data.key', key)
                  expect(response).to.have.deep.property('data.id', language + ':' + key)

                  return corbelDriver.resources.resource(I18N_COLLECTION, key)
                    .delete(params)
                    .should.be.eventually.fulfilled
                })
                .then(function () {
                  return corbelDriver.resources.resource(I18N_COLLECTION, key)
                    .get(params)
                    .should.be.eventually.rejected
                })
            }
          })
        })
        Promise.resolve(promise)
          .should.be.eventually.fulfilled.and.notify(done)
      })
    })
  })
})
