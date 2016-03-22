describe('In IAM module', function() {

    describe('when performing client CRUD operations', function() {
        var CorbelDriver;
        var domainId;

        before(function() {
            CorbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        var createClients = function(amount, domain, timeStamp) {
            var promises = [];

            for (var count = 1; count <= amount; count++) {

                var currentClient = corbelTest.common.iam.getClient(timeStamp, count);

                var promise = CorbelDriver.domain(domain).iam.client()
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
                domainId = id;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        after(function(done) {
            CorbelDriver.domain(domainId).iam.domain()
            .remove()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('a client is created', function(done) {
            var client = {
                name: 'testClient_' + Date.now(),
                signatureAlgorithm: 'HS256',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me']
            };
            var clientId;

            CorbelDriver.domain(domainId).iam.client()
            .create(client)
            .should.be.eventually.fulfilled
            .then(function(id) {
                clientId = id;
                return CorbelDriver.domain(domainId).iam.client(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', clientId);
                expect(response).to.have.deep.property('data.name', client.name);
                expect(response).to.have.deep.property('data.signatureAlgorithm', client.signatureAlgorithm);
                expect(response).to.have.deep.property('data.domain', domainId);
                expect(response).to.have.deep.property('data.scopes');
                response.data.scopes.forEach(function(scope){
                    expect(client.scopes).to.contain(scope);
                });
                return CorbelDriver.domain(domainId).iam.client(clientId)
                .remove()
                .should.be.eventually.fulfilled;
            }).
            should.notify(done);
        });

        it('two clients are created and both have differents keys', function(done) {
            var client1 = corbelTest.common.iam.getClient(undefined, 1);
            var client2 = corbelTest.common.iam.getClient(undefined, 2);
            var clientKey1;
            var clientId1;
            var clientId2;

            CorbelDriver.domain(domainId).iam.client()
            .create(client1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                clientId1 = id;
                return CorbelDriver.domain(domainId).iam.client(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(client) {
                expect(client).to.have.deep.property('data.id', clientId1);
                expect(client).to.have.deep.property('data.name', client1.name);
                expect(client).to.have.deep.property('data.signatureAlgorithm', client1.signatureAlgorithm);
                expect(client).to.have.deep.property('data.domain', domainId);
                expect(client).to.have.deep.property('data.scopes');
                client.data.scopes.forEach(function(scope){
                    expect(client1.scopes).to.contain(scope);
                });
                clientKey1 = client.key;
                return CorbelDriver.domain(domainId).iam.client()
                .create(client2)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                clientId2 = id;
                return CorbelDriver.domain(domainId).iam.client(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(client) {
                expect(client).to.have.deep.property('data.id', clientId2);
                expect(client).to.have.deep.property('data.name', client2.name);
                expect(client).to.have.deep.property('data.signatureAlgorithm', client2.signatureAlgorithm);
                expect(client).to.have.deep.property('data.domain', domainId);
                expect(client).to.have.deep.property('data.scopes');
                client.data.scopes.forEach(function(scope){
                    expect(client2.scopes).to.contain(scope);
                });
                expect(client.data.key).to.be.not.equals(clientKey1);
                return CorbelDriver.domain(domainId).iam.client(clientId1)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return CorbelDriver.domain(domainId).iam.client(clientId2)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('a client is updated', function(done) {
            var client = {
                name: 'testClient_' + Date.now(),
                signatureAlgorithm: 'HS256',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me']
            };
            var newName = 'newClientName';
            var clientId;

            CorbelDriver.domain(domainId).iam.client()
            .create(client)
            .should.be.eventually.fulfilled
            .then(function(id) {
                var newClient = {
                    id: id,
                    signatureAlgorithm: client.signatureAlgorithm,
                    name: newName
                };
                clientId = id;
                return CorbelDriver.domain(domainId).iam.client(newClient.id)
                .update(newClient)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return CorbelDriver.domain(domainId).iam.client(clientId)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', clientId);
                expect(response).to.have.deep.property('data.domain', domainId);
                expect(response).to.have.deep.property('data.name', newName);
                return CorbelDriver.domain(domainId).iam.client(clientId)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('a nonexistent client is not updated', function(done) {
            var expectedClient = {
                name: 'testClient_' + Date.now(),
                signatureAlgorithm: 'HS256',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me']
            };
            var newName = 'newClientName';
            var updatedClient = {
                id: 'newId',
                signatureAlgorithm: expectedClient.signatureAlgorithm,
                name: newName
            };
            CorbelDriver.domain(domainId).iam.client(updatedClient.id)
            .update(updatedClient)
            .should.be.eventually.fulfilled
            .then(function() {
                return CorbelDriver.domain(domainId).iam.client(updatedClient.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('a client is removed', function(done) {
            var client = {
                name: 'testClient_' + Date.now(),
                signatureAlgorithm: 'HS256',
                scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me']
            };
            var clientId;
            CorbelDriver.domain(domainId).iam.client()
            .create(client)
            .should.be.eventually.fulfilled
            .then(function(id) {
                clientId = id;
                return CorbelDriver.domain(domainId).iam.client(id)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return CorbelDriver.domain(domainId).iam.client(clientId)
                .get()
                .should.be.eventually.rejected;
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
                return CorbelDriver.domain(domainId).iam.client()
                .getAll()
                .should.be.eventually.fulfilled;
            })
            .then(function(clients) {
                var removeClientPromises = [];
                clients.data.forEach(function(client) {
                    expect(client).to.have.property('id');
                    expect(createdClientIds).to.contain(client.id);
                    removeClientPromises.push(
                        CorbelDriver.domain(domainId).iam.client(client.id)
                        .remove()
                    );
                });
                return Promise.all(removeClientPromises)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return CorbelDriver.domain(domainId).iam.domain()
                .remove()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
