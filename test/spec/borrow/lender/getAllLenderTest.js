// describe('In BORROW module, with the lender API', function() {
//
//     function createLenders(corbelDriver, amount, random) {
//         var lendersCreated = [];
//
//         var lender = {
//             borrowPeriod: 'P15D',
//             freeReturnPeriod: 'P1D',
//             reservationPeriod: 'P1D',
//             maxConcurrentLoansPerUser: random,
//             maxLoansPerUserInMonth: 30,
//             maxRenewalsPerResource: 2,
//             maxUsersInWaitingQueue: 10
//         };
//
//         function createLender(newDomain) {
//             app.session.destroy();
//             domainUtils.changeToDomain(newDomain);
//             lendersCreated.push(newDomain.domainId);
//
//             return borrow.lender().create(lender);
//         }
//
//         function createDomain(random) {
//             return corbelDriver.iam.domain().create({
//
//             }).
//             should.be.eventually.fulfilled;
//         }
//
//         var returnPromise = Promise.fulfill;
//
//         for (var i = 0; i < amount; ++i) {
//             returnPromise = returnPromise.
//             then(createDomain).
//             then(createLender).
//             should.be.eventually.fulfilled;
//         }
//
//         return {
//             lendersCreated: lendersCreated,
//             returnPromise: returnPromise
//         };
//     }
//
//     function removeLenders(corbelDriver, lendersCreated) {
//         var promises = [];
//
//         lendersCreated.forEach(function(lender) {
//             var promise = corbelDriver.borrow.lender(lender).delete().
//             should.eventually.be.fulfilled;
//
//             promises.push(promise);
//         });
//
//         return Promise.all(promises);
//     }
//
//     function checkLenders(lendersCreated) {
//         var check = true;
//
//         lendersCreated.forEach(function(lenderCreated) {
//             var checkLender = lenders.some(function(lender) {
//                 return lenderCreated === lender.id;
//             });
//
//             if (!checkLender) {
//                 check = false;
//             }
//         });
//
//         return check;
//     }
//
//     var corbelRootDriver, lendersCreated, random;
//
//     before(function(done) {
//         corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'];
//
//         lendersCreated = [];
//         random = Math.floor((Math.random() * 100000) + 1);
//
//         createLenders(5).should.be.eventually.fulfilled.
//         and.notify(done);
//     });
//
//     after(function(done) {
//         removeLenders().should.be.eventually.fulfilled.
//         and.notify(done);
//     });
//
//     it('can be consulted all lenders as ROOT', function(done) {
//         var params = {
//             query: [{
//                 '$eq': {
//                     maxConcurrentLoansPerUser: random
//                 }
//             }]
//         };
//
//         corbelRootDriver.borrow.lender().getAll(params).
//         should.be.eventually.fulfilled.
//         then(function(data) {
//             expect(checkLenders(data)).to.be.equals(true);
//         }).
//         should.notify(done);
//     });
//
// });
