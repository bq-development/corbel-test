/* jshint camelcase:false */
describe('In IAM module', function() {

    describe('while trying reset your password', function() {

        var corbelDriver;
        var corbelRootDriver;
        var user;
        var MAX_RETRY = 28;
        var RETRY_PERIOD = 3;
        var userMail = corbelTest.CONFIG.COMMON.MAIL.email;
        var passwordMail = corbelTest.CONFIG.COMMON.MAIL.password;
        var email;
        var MAX_RETRY_MAIL = 3;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();

            corbelTest.common.iam
                .createUsers(corbelDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(userData) {
                    user = userData[0];
                })
                .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam
                .user(user.id)
                .delete()
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('the request can be done with a non existent email', function(done) {
            corbelDriver.iam.users()
            .sendResetPasswordEmail('nonExistent@nothing.net')
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when resetPassword is used, a token that allows update the user is received [mail]', function(done) {
            var timestamp = Date.now();
            var oneTimeToken;
            var corbelResetDriver;
            var comingClaim;
            var userId;
            user.email = corbelTest.common.mail.imap.getRandomMail();

            var claims = {
                'type': 'TOKEN',
                'isOneUse': true,
                'userId': user.id,
                'clientId': corbelTest.CONFIG.DEFAULT_CLIENT.clientId,
                'domainId': corbelTest.CONFIG.DOMAIN
            };

            comingClaim = corbel.cryptography.rstr2b64(corbel.cryptography.str2rstr_utf8(JSON.stringify(claims)));

            corbelRootDriver.iam.user(user.id)
                .update({email: user.email})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.iam.users()
                        .sendResetPasswordEmail(encodeURIComponent(user.email))
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var queries = [
                        corbelTest.common.mail.imap.buildQuery('contain', 'delivered', user.email),
                        corbelTest.common.mail.imap.buildQuery('contain', 'text', comingClaim)
                    ];

                    return corbelTest.common.mail.imap
                        .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY_MAIL)
                        .should.be.eventually.fulfilled;
                })
                .then(function(mail) {
                    expect(mail).to.have.property('text')
                        .and.to.contain('Click on the link to reset your password');

                    oneTimeToken = corbelTest.common.mail.imap.getCodeFromMail(mail);

                    corbelResetDriver = corbelTest.getCustomDriver({
                        iamToken: {
                            accessToken: ''
                        },
                        domain: corbelTest.CONFIG.DOMAIN
                    });

                    return corbelResetDriver.iam.user('me')
                        .update({
                               password: user.password + user.password
                            })
                        .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'invalid_token');

                    corbelResetDriver = corbelTest.getCustomDriver({
                        iamToken: {
                            accessToken: oneTimeToken
                        },
                        domain: corbelTest.CONFIG.DOMAIN
                    });

                    return corbelResetDriver.iam.user('me')
                    .update({
                        password: user.password + user.password
                    })
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients
                        .loginUser(corbelDriver, user.username, user.password)
                        .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'no_such_principal');

                    return corbelTest.common.clients
                        .loginUser(corbelDriver, user.username, user.password + user.password)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('when resetPassword is used, a token is received but only can be used one time  [mail]', function(done) {
            var timestamp = Date.now();
            var oneTimeToken;
            var corbelResetDriver;
            user.email = corbelTest.common.mail.imap.getRandomMail();

            corbelRootDriver.iam.user(user.id)
                .update({email: user.email})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.iam.users()
                        .sendResetPasswordEmail(encodeURIComponent(user.email))
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var queries = [
                         corbelTest.common.mail.imap.buildQuery('contain', 'delivered', user.email),
                        corbelTest.common.mail.imap.buildQuery('contain', 'text', 
                            'Click on the link to reset your password')
                    ];

                    return corbelTest.common.mail.imap
                        .getMailWithQuery(userMail, passwordMail, 'imap.gmail.com', queries, MAX_RETRY_MAIL)
                        .should.be.eventually.fulfilled;
                })
                .then(function(mail) {
                    expect(mail).to.have.property('text')
                        .and.to.contain('Click on the link to reset your password');

                    oneTimeToken = corbelTest.common.mail.imap.getCodeFromMail(mail);
            
                    corbelResetDriver = corbelTest.getCustomDriver({
                        iamToken: {
                            accessToken: oneTimeToken
                        },
                        domain: corbelTest.CONFIG.DOMAIN
                    });

                    return corbelResetDriver.iam.user('me')
                    .update({
                        password: user.password + user.password
                    })
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelResetDriver.iam.user('me')
                    .update({
                        password: user.password
                    })
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'invalid_token');

                    return corbelTest.common.clients
                        .loginUser(corbelDriver, user.username, user.password + user.password)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});
