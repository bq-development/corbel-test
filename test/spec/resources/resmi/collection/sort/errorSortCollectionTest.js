describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing sort,', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectSortQuery' + Date.now();

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('when the request uses an incorrect sorting (sort = BAD) returns BAD REQUEST (400)', function(done) {
            var params = {
                sort: {
                    stringField: 'BAD'
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'invalid_sort');
            }).
            should.be.eventually.fulfilled.and.notify(done);
        });

        it('when the request uses an incorrect sorting, with correct json but diferent structure,' +
               ' returns BAD REQUEST (400)', function(done) {
            var params = {
                sort: {
                    '$gt': {
                        stringField: 'something'
                    }
                }
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'invalid_sort');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when the request uses an incorrect sorting (BAD_REQUEST = 1), returns BAD REQUEST (400)', function(done) {
            var params = {sort : {
                            BAD_REQUEST : 1
                            }
                          }; 

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'invalid_sort');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when the request uses an incorrect sorting (api:sort=BAD_JSON), returns BAD REQUEST (400)', function(done) {
            var params = {
                sort: 'BAD_JSON'
            };

            corbelDriver.resources.collection(COLLECTION)
            .get(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'invalid_sort');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

    });
});
