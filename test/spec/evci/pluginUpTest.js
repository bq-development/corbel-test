describe('In EVCI module', function() {

    it('we can consult what eworkers are up', function(done) {
    	var currentUrl = corbelTest.getConfig().localServices.indexOf('evci') !== -1 ? 
            corbelTest.getConfig().evciEndpoint :
            corbelTest.getConfig().urlBase.replace('{{module}}', 'evci');

        corbelTest.common.utils.consultPlugins(currentUrl)
        .should.be.eventually.fulfilled.and.should.notify(done);
    });           
});
