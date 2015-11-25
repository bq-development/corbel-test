describe('In corbel-test project', function() {

    this.timeout(10000);

    var corbelDriver;
    var TEST_OBJECT = {
        test: 'test',
        test2: 'test2',
        test3: 1,
        test4: 1.3,
        test5: {
            t1: 1.3,
            t2: [1, 2, 3.3]
        }
    };
    var COLLECTION = 'test:CorbelTest' + Date.now();
    var resourceId;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    it('can use default corbelDriver', function(done) {

        corbelDriver.resources.collection(COLLECTION)
            .add(TEST_OBJECT)
            .then(function(response) {
                resourceId = response;
                TEST_OBJECT.test6 = true;
                TEST_OBJECT.test = 'modified';

                return corbelDriver.resources.resource(COLLECTION, resourceId)
                    .update(TEST_OBJECT);
            })
            .then(function() {

                var canvas = document.createElement('canvas');
                canvas.id = 'myCanvas';
                canvas.width = 626;
                canvas.height = 626;

                document.getElementsByTagName('body')[0]
                    .appendChild(canvas);
                var context = canvas.getContext('2d');
                var imageObj = new Image();

                context.drawImage(imageObj, 0, 0);
                var blob = corbel.utils.dataURItoBlob(canvas.toDataURL());

                return corbelDriver.resources.resource(COLLECTION, resourceId)
                    .update(blob, {
                        dataType: 'image/png'
                    }
                )
                .should.be.eventually.fulfilled;

            })
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION, resourceId)
                    .delete({
                        dataType: 'image/png'
                    });
            })
            .should.be.eventually.fulfilled.notify(done);
    });

    it('corbelTest exist and has expected members', function() {
        expect(corbelTest).to.be.an('object');
        expect(corbelTest).to.include.keys(['fixtures']);
    });

    it('can access to fixtures cards access', function() {
        expect(corbelTest.fixtures.cards.cards).to.be.an('array');
    });

    it('can login as a random user', function(done) {
        // prevent modify default client
        var driver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        corbelTest.common.clients.loginAsRandomUser(driver)
            .should.be.eventually.fulfilled.and.notify(done);
    });

});
