describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing speed in collections ', function() {
        var corbelDriver;

        before(function() {
          corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('collection.get should be fast', function(done) {
            var pageNumber = 1;
            var pageSize = 49;
            var domain = 'booqs:nubico:demo';
            var date1, date2;
            date1=Date.now();

            corbelDriver.resources.collection('books:Category').get({
              pagination: {
                page: pageNumber,
                pageSize: pageSize
              },
              query: [{
                '$eq': {
                  'storeId': domain
                }
              }, {
                '$eq': {
                  'type': 'CATEGORY'
                }
              }],
              sort: {
                order: 'asc'
              }
            }).should.be.eventually.fulfilled
            .then(function(e) {
              date2 = Date.now();
              var finalDate = date2 - date1;
              expect(finalDate).to.be.below(300);
            })
            .should.notify(done);
        });
    });
});
