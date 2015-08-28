'use strict';

function createLoanableResources(corbelDriver, amount, availableLoans) {
    var promises = [];
    var resourcesIdOnLoanableResources = [];
    var timeStamp = Date.now();

    for (var count = 1; count <= amount; count++) {
        var resourceIdValue = 'resourceId_' + count + '_' + timeStamp;
        resourcesIdOnLoanableResources.push(resourceIdValue);

        var loanableResource = {
            resourceId: resourceIdValue,
            licenses: [{
                availableUses: 100,
                availableLoans: availableLoans,
                start: timeStamp - 100000,
                expire: timeStamp + 100000
            }],
            asset: {
                scopes: ['assets:test'],
                name: 'assets:test',
                period: 'P0D'
            }
        };

        var promise = corbelDriver.borrow.resource().add(loanableResource).
        should.eventually.be.fulfilled;

        promises.push(promise);
    }

    return {
        resourcesIdOnLoanableResources: resourcesIdOnLoanableResources,
        createdLoanableResources: Promise.all(promises)
    };
}

function cleanResourcesLoanables(corbelDriver, loanableResources) {
    var promises = [];

    function deleteLoanableResource(loanableResourceId) {
        promises.push(corbelDriver.borrow.resource(loanableResourceId).delete());
    }

    loanableResources.forEach(deleteLoanableResource);

    return Promise.all(promises);
}

module.exports = {
    createLoanableResources: createLoanableResources,
    cleanResourcesLoanables: cleanResourcesLoanables
};
