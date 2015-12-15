describe('In RESOURCES module', function() {

    describe('In FEEDBACK module', function() {
        var corbelDriver;
        var FEEDBACK_COLLECTION= 'feedback:Jira';

        before(function() {
          corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('a basic issue can be added.', function(done) {
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summary'
                
            };
            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('a issue with components id.', function(done) {
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summary',
                components: ['24321', '24322']
                
            };
            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('a issue with labels.', function(done) {
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summary',
                labels: ['labelTest']
                
            };
            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('a issue with description.', function(done) {
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summary',
                description: 'TES description'
                
            };
            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
