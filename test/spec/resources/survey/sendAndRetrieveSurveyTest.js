describe('In RESOURCES module', function() {
    describe('In SURVEY module', function() {
        describe('questions can be added and then a response survey is created and sended', function() {
            var popEmail = corbelTest.common.mail.mailInterface.popEmail;

            var corbelDriver;
            var bquizCorbelDriver;
            var satCorbelDriver;

            var questionTemplateId;
            var clientUrl = 'bquiz-client.com.s3-website-eu-west-1.amazonaws.com';

            var getBquizCorbelDriver = function() {
                return bquizCorbelDriver;
            };

            var getSatCorbelDriver = function() {
                return satCorbelDriver;
            };

            var tests = [{
                name: 'bquiz in Spanish [mail]',
                driver: getBquizCorbelDriver,
                language: 'es-ES',
                username: 'Batman',
                expectedSubject: 'Valora bq.'
            }, {
                name: 'sat in Spanish [mail]',
                driver: getSatCorbelDriver,
                language: 'es-ES',
                username: 'Batman',
                expectedSubject: 'Queremos saber tu'
            }, {
                name: 'bquiz in French [mail]',
                driver: getBquizCorbelDriver,
                language: 'fr-FR',
                username: 'Vincent',
                expectedSubject: 'votre avis compte'
            }, {
                name: 'bquiz in Portuguese [mail]',
                driver: getBquizCorbelDriver,
                language: 'pt-PT',
                username: 'Bruno',
                expectedSubject: 'Avalie a bq'
            }];

            var sendSurveys = function() {
                var promises = [];
                tests.forEach(function(test) {
                    var driver = test.driver().clone();
                    var promise = corbelTest.common.mail.mailInterface.getRandomMail().
                    then(function(email) {
                            test.email = email;
                            var survey = {
                                email: email,
                                delay: 'P0D',
                                questionsRequest: [{
                                    id: questionTemplateId,
                                    metadata: {
                                        'test': 'test question'
                                    }
                                }, {
                                    id: questionTemplateId,
                                    metadata: {
                                        'test': 'test2 question'
                                    }
                                }],
                                language: test.language,
                                orderId: 'order-' + Date.now(),
                                username: test.username
                            };

                            return driver.resources.collection('bquiz:Survey')
                                .add(survey)
                                .should.be.eventually.fulfilled;
                        })
                        .then(function() {
                            return driver.resources.resource('bquiz:Contact', test.email)
                                .get()
                                .should.be.eventually.fulfilled;
                        })
                        .then(function(response) {
                            expect(response).to.have.deep.property('data.contact', true);
                            expect(response).to.have.deep.property('data.id', test.email);
                        });

                    promises.push(promise);
                });
                return Promise.all(promises);
            };

            before(function(done) {
                var bquizDriverValues = corbelTest.CONFIG.clientCredentials.bquiz.CLIENT;
                bquizDriverValues.domain = corbelTest.CONFIG.clientCredentials.bquiz.DOMAIN;
                bquizCorbelDriver = corbelTest.getCustomDriver(bquizDriverValues);

                var satDriverValues = corbelTest.CONFIG.clientCredentials.sat.CLIENT;
                satDriverValues.domain = corbelTest.CONFIG.clientCredentials.sat.DOMAIN;
                satCorbelDriver = corbelTest.getCustomDriver(satDriverValues);

                corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();

                var question = {
                    description: 'This is the {{test}}',
                    title: 'This is the {{test}}',
                    sku: 'abc123'
                };

                corbelDriver.resources.collection('bquiz:Question')
                    .add(question)
                    .should.be.eventually.fulfilled
                    .then(function(id) {
                        questionTemplateId = id;
                    })
                    .then(function() {
                        return sendSurveys()
                            .should.be.eventually.fulfilled;
                    })
                    .should.notify(done);
            });

            tests.forEach(function(test) {
                it(test.name, function(done) {
                    popEmail(test.email)
                        .should.be.eventually.fulfilled
                        .then(function(mail) {
                            expect(mail).to.have.deep.property('subject').and.to.contain(test.expectedSubject);
                            expect(mail).to.have.deep.property('content').and.to.contain(clientUrl);
                            return corbelDriver.resources.resource('bquiz:Contact', test.email)
                                .delete()
                                .should.be.eventually.fulfilled;
                        })
                        .then(function() {
                            return corbelDriver.resources.resource('bquiz:Contact', test.email)
                                .get()
                                .should.be.eventually.rejected;
                        })
                        .then(function(e) {
                            expect(e).to.have.property('status', 404);
                            expect(e).to.have.deep.property('data.error', 'not_found');
                        })
                        .should.notify(done);
                });
            });

        });
    });
});
