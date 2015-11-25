describe('In RESOURCES module', function() {

    describe('Using 7digital REM', function() {
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });

        describe('metadata can be gotten', function() {

            it('from artists', function(done) {
                corbelDriver.resources.collection('music:Artist')
                    .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length').and.to.be.within(1, 50);
                })
                .should.notify(done);
            });

            it('from albums', function(done) {
                corbelDriver.resources.collection('music:Album')
                    .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length').and.to.be.within(1, 50);
                }).
                should.notify(done);
            });

            it('from tracks', function(done) {
                corbelDriver.resources.collection('music:Track')
                    .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length').and.to.be.within(1, 50);
                }).
                should.notify(done);
            });
        });

        describe('a search can be made over', function() {

            it('artists', function(done) {
                corbelDriver.resources.collection('music:Artist?7digital:query=pink')
                    .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length').and.to.be.within(1, 100);

                    return corbelDriver.resources.collection('music:Artist?7digital:query=the pink')
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length').and.to.be.within(1, 100);
                })
                .should.notify(done);
            });

            it('albums', function(done) {
                corbelDriver.resources.collection('music:Album?7digital:query=thing')
                    .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length').and.to.be.within(1, 100);

                    return corbelDriver.resources.collection('music:Album?7digital:query=thing sweet')
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length').and.to.be.within(1, 100);
                })
                .should.notify(done);
            });

            it('tracks', function(done) {
                corbelDriver.resources.collection('music:Track?7digital:query=last')
                    .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length').and.to.be.within(1, 100);

                    return corbelDriver.resources.collection('music:Track?7digital:query=last best')
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length').and.to.be.within(1, 100);
                })
                .should.notify(done);
            });
        });

        it('an streaming track can be gotten', function(done) {
            var TEST_TRACK = '29286725';

            corbelDriver.resources.resource('music:Track', TEST_TRACK)
                .get({dataType: 'audio/aacp-64', noRedirect: true})
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.uri')
                    .and.to.match(/^http:\/\/stream\.svc\.7digital\.net\/.*/);
            })
            .should.notify(done);
        });
    });
});
