describe('In RESOURCES module', function() {

    describe('In SURVEY module', function() {

        describe('questions can be added and then a response survey is created and sended', function() {

            var corbelDriver;
            var questionTemplateId;
            var orderIdentifier;
            var clientUrl = 'bquiz-client.com.s3-website-eu-west-1.amazonaws.com';
            var bquizDriverValues;
            var bquizCorbelDriver;
            var satDriverValues;
            var satCorbelDriver;
            var timestamp;
            var email;
            var userMail = corbelTest.CONFIG.clientCredentials.silkroad.email;
            var passwordMail = corbelTest.CONFIG.clientCredentials.silkroad.password;
            var MAX_RETRY = 7;

            var TEST_QUESTION = {
                description: 'This is the {{test}}',
                title: 'This is the {{test}}',
                sku: 'abc123'
            };

            before(function(done) {
                bquizDriverValues = corbelTest.CONFIG.clientCredentials.bquiz.CLIENT;
                bquizDriverValues.domain = corbelTest.CONFIG.clientCredentials.bquiz.DOMAIN;
                bquizCorbelDriver = corbelTest.getCustomDriver(bquizDriverValues);

                satDriverValues = corbelTest.CONFIG.clientCredentials.sat.CLIENT;
                satDriverValues.domain = corbelTest.CONFIG.clientCredentials.sat.DOMAIN;
                satCorbelDriver = corbelTest.getCustomDriver(satDriverValues);

                corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();

                corbelDriver.resources.collection('bquiz:Question')
                    .add(TEST_QUESTION)
                    .should.be.eventually.fulfilled
                    .then(function(id) {
                        questionTemplateId = id;
                    })
                    .should.notify(done);
            });

            beforeEach(function() {
                email = corbelTest.common.mail.imap.getRandomMail();
                orderIdentifier = 'order-' + timestamp;
                timestamp = Date.now();
            });

            afterEach(function(done) {

                corbelDriver.resources.resource('bquiz:Contact', email)
                    .delete()
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelDriver.resources.resource('bquiz:Contact', email)
                            .get()
                            .should.be.eventually.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 404);
                        expect(e).to.have.deep.property('data.error', 'not_found');
                    })
                    .should.notify(done);
            });

            it('bquiz in Spanish [mail]', function(done) {
                var TEST_SURVEY = {
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
                    language: 'es-ES',
                    orderId: orderIdentifier,
                    username: 'Batman '+timestamp
                };
                bquizCorbelDriver.resources.collection('bquiz:Survey')
                    .add(TEST_SURVEY)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return bquizCorbelDriver.resources.resource('bquiz:Contact', encodeURIComponent(email))
                            .get()
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.contact', true);
                        expect(response).to.have.deep.property('data.id', email);

                        var queries = [
                            corbelTest.common.mail.imap.buildQuery('contain', 'delivered', email),
                            corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'Valora bq.')
                        ];

                        return corbelTest.common.mail.imap
                            .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(mail){
                        expect(mail).to.have.deep.property('subject').and.to.contain('Valora bq.');
                        expect(mail).to.have.deep.property('text').and.to.contain(clientUrl);
                    })
                    .should.notify(done);
            });

            it('sat in Spanish [mail]', function(done) {
                var TEST_SURVEY = {
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
                    language: 'es-ES',
                    orderId: orderIdentifier,
                    username: 'Batman'
                };

                satCorbelDriver.resources.collection('bquiz:Survey')
                    .add(TEST_SURVEY)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return satCorbelDriver.resources.resource('bquiz:Contact', encodeURIComponent(email))
                            .get()
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.contact', true);
                        expect(response).to.have.deep.property('data.id', email);

                        var queries = [
                            corbelTest.common.mail.imap.buildQuery('contain', 'delivered', email),
                            corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'Queremos saber tu')
                        ];

                        return corbelTest.common.mail.imap
                            .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(mail) {
                        expect(mail).to.have.deep.property('subject').and.to.contain('Queremos saber tu');
                        expect(mail).to.have.deep.property('text').and.to.contain(clientUrl);
                    })
                    .should.notify(done);
            });

            it('bquiz in French [mail]', function(done) {
                var TEST_SURVEY = {
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
                    language: 'fr-FR',
                    orderId: orderIdentifier,
                    username: 'Vincent'+timestamp
                };

                bquizCorbelDriver.resources.collection('bquiz:Survey')
                    .add(TEST_SURVEY)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return bquizCorbelDriver.resources.resource('bquiz:Contact', encodeURIComponent(email))
                            .get()
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.contact', true);
                        expect(response).to.have.deep.property('data.id', email);

                        var queries = [
                            corbelTest.common.mail.imap.buildQuery('contain', 'delivered', email),
                            corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'votre avis compte')
                        ];

                        return corbelTest.common.mail.imap
                            .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(mail) {
                        expect(mail).to.have.deep.property('subject')
                            .and.to.contain('votre avis compte');
                        expect(mail).to.have.deep.property('text').and.to.contain(clientUrl);
                    })
                    .should.notify(done);
            });

            it('bquiz in Portuguese [mail]', function(done) {
                var TEST_SURVEY = {
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
                    language: 'pt-PT',
                    orderId: orderIdentifier,
                    username: 'Bruno'+timestamp
                };

                bquizCorbelDriver.resources.collection('bquiz:Survey')
                    .add(TEST_SURVEY)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return bquizCorbelDriver.resources.resource('bquiz:Contact', encodeURIComponent(email))
                            .get()
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.contact', true);
                        expect(response).to.have.deep.property('data.id', email);

                        var queries = [
                            corbelTest.common.mail.imap.buildQuery('contain', 'delivered', email),
                            corbelTest.common.mail.imap.buildQuery('contain', 'subject', 'Avalie a bq')
                        ];

                        return corbelTest.common.mail.imap
                            .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(mail) {
                        expect(mail).to.have.deep.property('subject')
                            .and.to.contain('Avalie a bq');
                        expect(mail).to.have.deep.property('text').and.to.contain(clientUrl);
                    })
                    .should.notify(done);
            });
        });
    });
});