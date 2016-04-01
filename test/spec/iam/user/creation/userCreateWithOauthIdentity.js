describe('In IAM module', function() {

    describe('while testing create user with oauth identity', function(){

        var corbelDriver;
        var userId;
        var random = Date.now();
        var oauthIdentifier;
        var emailDomain = '@funkifake.com';
        var authorize;
        var corbelIamDriver;

        var userOauth = {
            'username': 'createUserOauthTest' + random,
            'password': 'passwordTest',
            'email': 'createUserOauthTest' + random + emailDomain
        };

        var userIam = {
            'firstName': 'createUserIam' + random,
            'email': 'createUserIam.iam.' + random + emailDomain,
            'username': 'createUserIam.iam.' + random + emailDomain
        };

        var devCredentials = corbelTest.CONFIG.DEV_CREDENTIALS;
        var devIamUser = devCredentials.DEFAULT_USER_IAM;
        var devOauthClient = devCredentials.DEFAULT_CLIENT_OAUTH;
        var oauthCommon = corbelTest.common.oauth;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelIamDriver = corbelTest.drivers['ADMIN_USER'].clone();
            var authorizationParams = oauthCommon.getClientParamsCodeIAM(corbelDriver, devIamUser, devOauthClient);
            authorize = corbelDriver.oauth.authorization(authorizationParams);
            
            corbelDriver.oauth
                .user(oauthCommon.getClientParams())
                .create(userOauth)
                .should.be.eventually.fulfilled
                .then(function (id) {
                    oauthIdentifier = id;
                })
                .should.notify(done);
        });

        afterEach(function(done){
            authorize
                .signout()
                .should.be.eventually.fulfilled
                .then(function(){
                     return oauthCommon.getToken(corbelDriver, userOauth.username, userOauth.password)
                        .should.be.eventually.fulfilled;
                })
                .then(function (response) {
                    var accessToken = response.data['access_token'];
                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), accessToken)
                        .delete('me')
                        .should.be.eventually.be.fulfilled;
                })
                .then(function(){
                    return corbelIamDriver.iam
                        .user(userId)
                        .delete()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('logged in using oauth identity', function(done){
            var setCookie = false;
            var noRedirect = false;

            corbelIamDriver.iam.users()
                .create(userIam)       
                .should.be.eventually.fulfilled
                .then(function(id) {
                    userId = id;
                    return corbelIamDriver.iam
                        .user(userId)
                        .addIdentity({
                            'oauthService': 'silkroad',
                            'oauthId': oauthIdentifier
                        });
                })
                .then(function(){
                    return authorize
                        .login(userOauth.email, userOauth.password, setCookie, noRedirect)
                        .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.iam
                        .user()
                        .get('me')
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('created user with identity and logged in using oauth identity', function(done){
            var setCookie = false;
            var noRedirect = false;

            corbelIamDriver.iam.users()
                .create({
                    'firstName': 'createUserIam' + random,
                    'email': 'createUserIam.iam.' + random + emailDomain,
                    'username': 'createUserIam.iam.' + random + emailDomain,
                    'identity': {
                        'oauthService': 'silkroad',
                        'oauthId': oauthIdentifier
                    }
                })       
                .should.be.eventually.fulfilled
                .then(function(id) {
                    userId = id;
                    return authorize
                        .login(userOauth.email, userOauth.password, setCookie, noRedirect)
                        .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.iam
                        .user()
                        .get('me')
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});