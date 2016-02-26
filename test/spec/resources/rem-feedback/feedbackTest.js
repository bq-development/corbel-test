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

        it('an issue with a video attachment can be added', function(done) {
            var video = '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'; // jshint ignore:line

            var ATTACHMENT = {
                content: video,
                name: 'video.mp4'
            };
            var FEEDBACK_METADATA = {
                project: 'TES',
                issueType: 'Bug',
                summary: 'test summaryVideoAttachment',
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
