describe('In IAM module', function() {
    var CorbelDriver;

    before(function() {
        CorbelDriver = corbelTest.drivers['ROOT_CLIENT'];
    });

    describe('when performing client CRUD operations', function() {
        var testDomainId;

        var createClients = function(amount, domain, timeStamp) {
            var promises = [];

            for (var count = 1; count <= amount; count++) {

                var currentClient = corbelTest.common.iam.getClient(timeStamp, domain, count);

                var promise = CorbelDriver.iam.client(domain)
                .create(currentClient)
                .should.be.eventually.fulfilled;

                promises.push(promise);
            }

            return Promise.all(promises);
        };

        before(function(done) {
            CorbelDriver.iam.domain()
            .create(corbelTest.common.iam.getDomain())
            .should.be.eventually.fulfilled
            .then(function(id) {
                testDomainId = id;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        after(function(done) {
            CorbelDriver.iam.domain(testDomainId)
            .remove()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('a client is created', function(done) {
            var timeStamp = Date.now();
            var expectedClient = corbelTest.common.iam.getClient(timeStamp, testDomainId);
            var createdClientId;

            CorbelDriver.iam.client(expectedClient.domain)
            .create(expectedClient)
            .should.be.eventually.fulfilled
            .then(function(id) {
                createdClientId = id;
                delete expectedClient.id;

                return CorbelDriver.iam.client(expectedClient.domain, id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(client) {
                expect(client).to.have.deep.property('data.id', createdClientId);
                expect(client).to.have.deep.property('data.name', expectedClient.name);
                expect(client).to.have.deep.property('data.signatureAlgorithm', expectedClient.signatureAlgorithm);
                expect(client).to.have.deep.property('data.domain', expectedClient.domain);
                expect(client).to.have.deep.property('data.scopes');
                client.data.scopes.forEach(function(scope){
                    expect(expectedClient.scopes).to.contain(scope); 
                });

                return CorbelDriver.iam.client(expectedClient.domain, createdClientId)
                .remove()
                .should.be.eventually.fulfilled;
            }).
            should.be.eventually.fulfilled.and.notify(done);
        });

        it('2 clients are created and have differents keys', function(done) {
            var client1 = corbelTest.common.iam.getClient(undefined, testDomainId, 1);
            var client2 = corbelTest.common.iam.getClient(undefined, testDomainId, 2);
            var clientKey1;
            var clientId1;
            var clientId2;

            CorbelDriver.iam.client(client1.domain)
            .create(client1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                clientId1 = id;

                return CorbelDriver.iam.client(client1.domain, id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(client) {
                expect(client).to.have.deep.property('data.id', clientId1);
                expect(client).to.have.deep.property('data.name', client1.name);
                expect(client).to.have.deep.property('data.signatureAlgorithm', client1.signatureAlgorithm);
                expect(client).to.have.deep.property('data.domain', client1.domain);
                expect(client).to.have.deep.property('data.scopes');
                client.data.scopes.forEach(function(scope){
                    expect(client1.scopes).to.contain(scope); 
                });
                clientKey1 = client.key;

                return CorbelDriver.iam.client(client2.domain)
                .create(client2)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                clientId2 = id;

                return CorbelDriver.iam.client(client2.domain, id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(client) {
                expect(client).to.have.deep.property('data.id', clientId2);
                expect(client).to.have.deep.property('data.name', client2.name);
                expect(client).to.have.deep.property('data.signatureAlgorithm', client2.signatureAlgorithm);
                expect(client).to.have.deep.property('data.domain', client2.domain);
                expect(client).to.have.deep.property('data.scopes');
                client.data.scopes.forEach(function(scope){
                    expect(client2.scopes).to.contain(scope); 
                });
                expect(client.data.key).to.be.not.equals(clientKey1);

                return CorbelDriver.iam.client(client1.domain, clientId1)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return CorbelDriver.iam.client(client2.domain, clientId2)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });



        it('a client is updated', function(done) {
            var expectedClient = corbelTest.common.iam.getClient(Date.now(), testDomainId);
            var newName = 'newClientName';
            var expectedClientId;

            CorbelDriver.iam.client(expectedClient.domain)
            .create(expectedClient)
            .should.be.eventually.fulfilled
            .then(function(id) {
                var newClient = {
                    id: id,
                    domain: expectedClient.domain,
                    signatureAlgorithm: expectedClient.signatureAlgorithm,
                    name: newName
                };
                expectedClientId = id;

                return CorbelDriver.iam.client(expectedClient.domain, newClient.id)
                .update(newClient)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return CorbelDriver.iam.client(expectedClient.domain, expectedClientId)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(client) {
                expect(client).to.have.deep.property('data.id', expectedClientId);
                expect(client).to.have.deep.property('data.domain', expectedClient.domain);
                expect(client).to.have.deep.property('data.name', newName);

                return CorbelDriver.iam.client(expectedClient.domain, expectedClientId)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('a client is removed', function(done) {
            var client = corbelTest.common.iam.getClient(Date.now(), testDomainId);
            var clientId;

            CorbelDriver.iam.client(client.domain)
            .create(client)
            .should.be.eventually.fulfilled
            .then(function(id) {
                clientId = id;

                return CorbelDriver.iam.client(client.domain, id)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return CorbelDriver.iam.client(client.domain, clientId)
                .get()
                .should.eventually.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when requests to get all clients, successes', function(done) {
            var timeStamp = Date.now();
            var domainId;
            var createdClientIds = [];

            CorbelDriver.iam.domain()
            .create(corbelTest.common.iam.getDomain(timeStamp))
            .should.be.eventually.fulfilled
            .then(function(id) {
                domainId = id;

                return createClients(5, domainId, timeStamp)
                .should.be.eventually.fulfilled;
            })
            .then(function(obtainedCreatedClientIds) {
                createdClientIds = obtainedCreatedClientIds;

                return CorbelDriver.iam.client(domainId)
                .getAll()
                .should.be.eventually.fulfilled;
            })
            .then(function(clients) {
                var removeClientPromises = [];

                clients.data.forEach(function(client) {
                    expect(client).to.have.property('id');
                    expect(createdClientIds).to.contain(client.id);

                    removeClientPromises.push(
                        CorbelDriver.iam.client(domainId, client.id)
                        .remove()
                    );
                });

                return Promise.all(removeClientPromises)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return CorbelDriver.iam.domain(domainId)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
