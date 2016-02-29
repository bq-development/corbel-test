describe('In EVCI module', function () {
  it('we can consult what eworkers are up', function (done) {
    var currentUrl = corbelTest.getCurrentEndpoint('evci')

    corbelTest.common.utils.consultPlugins(currentUrl)
      .should.be.eventually.fulfilled.and.should.notify(done)
  })
})
