describe('In RESOURCES module', function () {
  describe('In RESTOR module, while testing CRUD operations', function () {
    var corbelDriver

    before(function () {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()
    })

    var createGetAndDeleteRestorFlow = function (fileName, data, type) {
      var folder = 'test:Restor'
      var fileId = fileName

      return corbelDriver.resources.resource(folder, fileId)
        .update(data, {dataType: type})
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.resources.resource(folder, fileId)
            .get({dataType: type})
            .should.be.eventually.fulfilled
        })
        .then(function (resource) {
          expect(resource).to.have.property('data', data.toString())

          return corbelDriver.resources.resource(folder, fileId)
            .delete({dataType: type})
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return corbelDriver.resources.resource(folder, fileId)
            .get({dataType: type})
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
    }

    it('should make an entire flow for a file in RESTOR in octet-stream sending a binary array', function (done) {
      var fileName = 'RestorFileName' + Date.now()
      var fileContent = 'this Is My binary fileee!!! ññáaäéó' + Date.now()
      var byteContent = []
      for (var i = 0; i < fileContent.length; i++) {
        byteContent.push(fileContent.charCodeAt(i))
      }

      createGetAndDeleteRestorFlow(fileName, byteContent, 'application/octet-stream')
        .should.be.eventually.fulfilled.and.notify(done)
    })

    it('should make an entire flow for a file in RESTOR in octet-stream sending a string', function (done) {
      var fileName = 'RestorFileName' + Date.now()
      var fileContent = 'this Is My string fileee!!! ññáaäéó' + Date.now()

      createGetAndDeleteRestorFlow(fileName, fileContent, 'application/octet-stream')
        .should.be.eventually.fulfilled.and.notify(done)
    })

    it('should make an entire flow for a file in RESTOR in blob sending a binary array', function (done) {
      var fileName = 'RestorFileName' + Date.now()
      var fileContent = 'this Is My binary fileee!!! ññáaäéó' + Date.now()
      var byteContent = []
      for (var i = 0; i < fileContent.length; i++) {
        byteContent.push(fileContent.charCodeAt(i))
      }

      createGetAndDeleteRestorFlow(fileName, byteContent, 'application/blob')
        .should.be.eventually.fulfilled.and.notify(done)
    })

    it('should make an entire flow for a file in RESTOR in blob sending a string', function (done) {
      var fileName = 'RestorFileName' + Date.now()
      var fileContent = 'this Is My string fileee!!! ññáaäéó' + Date.now()

      createGetAndDeleteRestorFlow(fileName, fileContent, 'application/blob')
        .should.be.eventually.fulfilled.and.notify(done)
    })

    it('should make an entire flow for a file in RESTOR in XML', function (done) {
      var fileName = 'RestorXMLName' + Date.now()
      var XML_CONTENT = '<test><date>' + Date.now() + '</date></test>'

      createGetAndDeleteRestorFlow(fileName, XML_CONTENT, 'application/xml')
        .should.be.eventually.fulfilled.and.notify(done)
    })
  })
})
