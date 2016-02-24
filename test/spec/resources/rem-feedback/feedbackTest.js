describe('In RESOURCES module', function() {

    describe('In FEEDBACK module', function() {
        var corbelDriver;
        var FEEDBACK_COLLECTION = 'feedback:Jira';

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('a basic issue can be added', function(done) {
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summary'
            };

            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an issue with an attachment can be added', function(done) {
            var image = 'Qk2eAAAAAAAAAHoAAABsAAAAAwAAAAMAAAABABgAAAAAACQAAAATCwAAEwsAAAAAAAAAAAAAQkdScwAAAAAAAA'+
                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAD//wD/AP//'+
                  'AAAAAABmZmYA/wAAAH8AAAAAAP9/AAAA//8AAAA=';
            var ATTACHMENT = {
                content: image,
                name: 'pre.tt.y.bmp'
            };
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summaryImageAttachment',
                attachment: ATTACHMENT
            };

            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an issue with a text in base64 attachment can be added', function(done) {
            var text = 'VGVzdA==';
            var ATTACHMENT = {
                content: text,
                name: 'pre.tt.y.txt'
            };
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summaryTextAttachment',
                attachment: ATTACHMENT
            };

            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an issue with components can be added', function(done) {
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summary',
                components: ['composr']
            };

            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an issue with labels can be added', function(done) {
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

        it('an issue with description can be added', function(done) {
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

        it('an issue with description with strange characters can be added', function(done) {
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summary',
                description: 'áéíóúññññ\nabcdefg'
            };

            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an issue with components, description and labels can be added', function(done) {
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summary',
                components: ['composr'],
                description: 'test description',
                labels: ['test', 'label']
            };

            corbelDriver.resources.collection(FEEDBACK_COLLECTION)
                .add(FEEDBACK_METADATA)
                .should.be.eventually.fulfilled.and.notify(done);
        });

    });
});
