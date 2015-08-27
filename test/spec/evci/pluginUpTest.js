describe('In EVCI module', function() {
    it('we can consult what eworkers are up', function(done) {
        var url = corbelTest.CONFIG.COMMON.urlBase.replace('{{module}}', 'evci') ;

        corbelTest.common.utils.consultPlugins(url).should.eventually.be.fulfilled.should.notify(done);
    });
            
});