(function() {
    //@exclude
    'use strict';
    /*globals corbel */
    //@endexclude

    var corbelTest.resources = {};
    var createdQueryObject = [];

    var successHandler = function(list, collection, id) {
        list.push({
            collection: collection,
            id: id
        });
    };

    var createIntegerSecuence = function(length) {
        var list = [];
        for (var i = 1; i <= length; i++) {
            list.push(i);
        }
        return list;
    };

    corbelTest.resources.createdObjectsToQuery = function(driver, collectionName, amount, extraField) {
        var promises = [];

        for (var count = 1; count <= amount; count++) {
            var json = {
                stringField: 'stringFieldContent' + count,
                intField: 100 * count,
                computableField: count + (1/3),
                stringSortCut: 'Test Short Cut',
                codingTest: 'ñÑçáéíóúàèìòùâêîôû\'',
                ObjectNumber: createIntegerSecuence(count),
                ObjectMatch: [{
                    name: 'basic',
                    identifier: 'id' + count,
                    type: 'basic'
                }, {
                    name: 'premium',
                    identifier: 'id' + count,
                    type: 'premium'
                }]
            };

            if(extraField) {
                json.extra = extraField; 
            }

            var promise = driver.resources.collection(collectionName).add(json);
            promises.push(promise);
            promise.then(successHandler.bind(this, createdQueryObject, collectionName));
        }
        return Promise.all(promises);
    };

    corbelTest.resources.cleanResourcesQuery = function(driver) {
        var promises = [];
        createdQueryObject.forEach(function(entry) {
            var promise = driver.resources.resource(entry.collection, entry.id).delete();
            promises.push(promise);
        });
        createdQueryObject = [];
        return Promise.all(promises);
    };
})();
