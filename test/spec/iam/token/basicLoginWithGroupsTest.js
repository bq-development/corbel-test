describe('In IAM module, create a user is logged which belongs to a group and login with basic', function() {

    var corbelDefaultDriver;
    var corbelRootDriver;
    var corbelGroupDriver;
    var resourceId;

    var domain = {
        id: 'domainId-' + Date.now(),
        description: 'New domain',
        scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete',
            'iam:group:admin', 'iam:user:group:admin', 'iam:user:read',
            'resources:music:favorite:admin', 'resources:music:read_catalog',
            'resources:test:test_operations'
        ],
        defaultScopes: ['iam:user:me']
    };

    var client = {
        name: 'client1',
        signatureAlgorithm: 'HS256',
        scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete',
            'iam:group:admin', 'iam:user:group:admin', 'iam:user:read'
        ],
        defaultScopes: ['iam:user:me']
    };

    var userData = {
        email: 'myEmail' + Date.now() + '@funkifake.com',
        username: 'new user' + Date.now(),
        password: 'password',
        scopes: undefined
    };

    var group = {
        name: 'testGroup_' + Date.now(),
        scopes: ['resources:music:favorite:admin']
    };

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

    var clientGroup = {
        name: 'clientGroup',
        signatureAlgorithm: 'HS256',
        scopes: ['resources:music:favorite:admin', 'resources:music:read_catalog', 'resources:test:test_operations'],
        defaultScopes: ['iam:user:me']
    };

    before(function(done) {

        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        corbelRootDriver.resources.collection('test:Artist', resourceId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.domain().create(domain)
                    .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                domain.id = id;
                return corbelRootDriver.iam.client(domain.id)
                    .create(client)
                    .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                client.id = id;
                return corbelRootDriver.iam.client(domain.id, client.id)
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                client = response.data;
                client.clientSecret = client.key;
                corbelDefaultDriver = corbel.getDriver({
                    'clientId': client.id,
                    'clientSecret': client.key,
                    'urlBase': corbelTest.CONFIG.COMMON.urlBase,
                    'scopes': client.scopes.join(' ')
                });

                return corbelDefaultDriver.iam.token()
                    .create()
                    .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDefaultDriver.iam.users()
                    .create(userData)
                    .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                userData.id = id;
            })
            .should.notify(done);
    });

    after(function(done) {

        corbelDefaultDriver.iam.user(userData.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDefaultDriver.iam.group(group.id)
                    .delete()
                    .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.client(domain.id, client.id)
                    .remove()
                    .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.domain(domain.id)
                    .remove()
                    .should.be.eventually.fulfilled;
            })
            .should.notify(done);
    });

    it('successes accessing to group scopes urls', function(done) {
        corbelTest.common.clients
            .loginUser(corbelDefaultDriver, userData.username, userData.password)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDefaultDriver.resources.collection('music:Artist')
                    .get()
                    .should.be.eventually.rejected;
            })
            .then(function(e) {
                var error = e.data;
                expect(e).to.have.property('status', 401);
                expect(error).to.have.property('error', 'invalid_token');
                corbelDefaultDriver = corbel.getDriver({
                    'clientId': client.id,
                    'clientSecret': client.key,
                    'urlBase': corbelTest.CONFIG.COMMON.urlBase,
                    'scopes': client.scopes.join(' ')
                });

                return corbelDefaultDriver.iam.token()
                    .create()
                    .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDefaultDriver.iam.group()
                    .create(group)
                    .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                group.id = id;
                return corbelDefaultDriver.iam.user(userData.id)
                    .addGroups([group.id])
                    .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDefaultDriver.iam.user(userData.id)
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(userWithGroups) {
                expect(userWithGroups).to.have.deep.property('data.groups').and.to.contain(group.id);
                return corbelRootDriver.iam.client(domain.id)
                    .create(clientGroup)
                    .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                clientGroup.id = id;
                return corbelRootDriver.iam.client(domain.id, clientGroup.id)
                    .get()
                    .should.be.eventually.fulfilled;
            }).then(function(response) {
                clientGroup = response.data;
                clientGroup.clientSecret = clientGroup.key;
                corbelGroupDriver = corbel.getDriver({
                    'clientId': clientGroup.id,
                    'clientSecret': clientGroup.key,
                    'urlBase': corbelTest.CONFIG.COMMON.urlBase,
                    'scopes': clientGroup.scopes.join(' ')
                });

                return corbelGroupDriver.iam.token()
                    .create()
                    .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelGroupDriver.resources.collection('test:Artist')
                    .add(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                resourceId = id;
                return corbelGroupDriver.resources.collection('test:Artist')
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data[0]).to.have.deep.property('id', resourceId);
            })
            .should.notify(done);
    });


});
