describe('In RESOURCES module', timedTest(function() {

    var random = Date.now();

    describe('Using bitbloq REM', function() {
        var corbelDriver;
        var corbelRootDriver;
        var user;
        var COLLECTION_BITBLOQ = 'bitbloq:Program';
        var MAX_RETRY = 20;
        var RETRY_PERIOD = 2;


        var getCode = function(random) {
            return ' void setup(){} void loop(){char x[] = \"char+' + random + '\";}';
        };

        var getBoard = function() {
            var boards = ['uno', 'atmega328', 'diecimila', 'nano328', 'nano', 'mega2560', 'mega',
                'leonardo', 'esplora', 'micro','mini328', 'mini', 'ethernet', 'fio', 'bt328',
                'bt', 'LilyPadUSB', 'lilypad328', 'lilypad', 'pro5v328', 'pro5v',
                'pro328', 'pro', 'atmega168', 'atmega8', 'robotControl', 'robotMotor'
            ];

            return boards[getRandomInt(0, boards.length - 1)];
        };

        var getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        };


        before(function(done) {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser
                    (corbelDriver, user.username, user.password)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelRootDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        describe('a job to bitbloq can be sended and', function() {
            var currentBoard = getBoard();
            var bitbloqRequest = {
                arch: 'arduino',
                board: currentBoard,
                code: getCode(random)
            };
            var idStoredProgram;

            before(function(done) {
                corbelRootDriver.resources.collection(COLLECTION_BITBLOQ)
                    .add(bitbloqRequest)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    idStoredProgram = id;
                })
                .should.notify(done);
            });

            after(function(done) {
                corbelRootDriver.resources.resource(COLLECTION_BITBLOQ, idStoredProgram)
                    .delete()
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelRootDriver.resources.resource(COLLECTION_BITBLOQ, idStoredProgram)
                        .delete({dataType: 'application/octet-stream'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelRootDriver.resources.resource(COLLECTION_BITBLOQ, idStoredProgram)
                        .get()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');

                    return corbelRootDriver.resources.resource(COLLECTION_BITBLOQ, idStoredProgram)
                        .get({dataType: 'application/octet-stream'})
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });

            it('the resource with the compilation information from bibloq collection can be gotten', function(done) {
                corbelTest.common.utils.retry(function() {
                    return corbelRootDriver.resources.resource(COLLECTION_BITBLOQ, idStoredProgram)
                        .get()
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        if (response.data.state !== 'QUEUE' && response.data.state !== 'IN_PROGRESS') {
                            return response;
                        } else {
                            return Promise.reject();
                        }
                    });
                }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled
                .then(function(response) {
                        expect(response).to.have.deep.property('data.code', getCode(random));
                        expect(response).to.have.deep.property('data.type', 'arduino');
                        expect(response).to.have.deep.property('data.board', currentBoard);
                        expect(response).to.have.deep.property('data.state', 'FINISHED');
                })
                .should.notify(done);
            });

            it('if the same code with the same type was compiled before, silkroad return the response with uri of resource', function(done) {
                resources.collection(COLLECTION_BITBLOQ).add(bitbloqRequest, 'application/json').
                should.be.eventually.fulfilled.
                then(function(id) {
                    expect(id).to.be.equal(idStoredProgram);
                }).
                should.notify(results.to(done));
            });

            it('then we can get the bin file of compilation, and this bin is the same when we recompile the program', function(done) {
                var firstBin;
                var secondBin;
                functionUtils.retry(
                    function() {
                        return resources.resource(COLLECTION_BITBLOQ, idStoredProgram).get('application/octet-stream').
                        then(function(data) {
                            expect(data).to.be.not.equal(null);
                            firstBin = data;
                        });
                    }, MAX_RETRY, RETRY_PERIOD).
                should.be.eventually.fulfilled.
                then(function() {
                    return resources.collection(COLLECTION_BITBLOQ).add(bitbloqRequest, 'application/json').
                    should.be.eventually.fulfilled;
                }).
                then(function(id) {
                    expect(id).to.be.equal(idStoredProgram);
                    return functionUtils.retry(
                        function() {
                            return resources.resource(COLLECTION_BITBLOQ, idStoredProgram).get('application/octet-stream').
                            then(function(data) {
                                expect(data).to.be.not.equal(null);
                                secondBin = data;
                            });
                        }, MAX_RETRY, RETRY_PERIOD).
                    should.be.eventually.fulfilled;
                }).
                then(function() {
                    expect(firstBin).to.be.equal(secondBin);
                }).
                should.notify(results.to(done));
            });

            it('if the code have errors, the compilation resource will have ERROR status', function(done) {
                var bitbloqRequestWithBadCode = {
                    arch: 'arduino',
                    board: currentBoard,
                    code: 'BAD CODE'
                };
                var badIdStored;

                resources.collection(COLLECTION_BITBLOQ).add(bitbloqRequestWithBadCode, 'application/json').
                should.be.eventually.fulfilled.
                then(function(id) {
                    badIdStored = id;
                    return functionUtils.retry(
                        function() {
                            return resources.resource(COLLECTION_BITBLOQ, badIdStored).get().
                            then(function(data) {
                                if (data.state !== 'QUEUE' && data.state !== 'IN_PROGRESS') {
                                    expect(data.code).to.be.equal('BAD CODE');
                                    expect(data.type).to.be.equal('arduino');
                                    expect(data.board).to.be.equal(currentBoard);
                                    expect(data.state).to.be.equal('ERROR');
                                } else {
                                    return q.reject();
                                }
                            });
                        }, MAX_RETRY, RETRY_PERIOD).
                    should.be.eventually.fulfilled;
                }).
                then(function() {
                    return resources.resource(COLLECTION_BITBLOQ, badIdStored).delete().
                    should.be.eventually.fulfilled;
                }).
                then(function() {
                    return resources.resource(COLLECTION_BITBLOQ, badIdStored).get().
                    should.be.eventually.reject;
                }).
                then(function() {
                    return resources.resource(COLLECTION_BITBLOQ, badIdStored).get('application/octet-stream').
                    should.be.eventually.reject;
                }).
                should.notify(results.to(done));
            });
        });

        describe('if the request to bitbloq is malformed ', function() {
            it('failed returning error BAD REQUEST(400)', function(done) {
                var bitbloqRequestMalFormed = {
                    architecture: 'architecture'
                };

                resources.collection(COLLECTION_BITBLOQ).add(bitbloqRequestMalFormed, 'application/json').
                should.eventually.be.rejected.
                then(function(e) {
                    expect(e).to.have.property('httpStatus', 400);
                }).
                should.notify(results.to(done));
            });
        });
    });
});

