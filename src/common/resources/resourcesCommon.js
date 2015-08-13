(function() {
    //@exclude
    'use strict';
    /*globals corbel */
    //@endexclude

    corbelTest.resources = {};
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
                }],
                objectDate: 1436803200 + (3600 * 24 * count)
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

    corbelTest.resources.checkSortingAsc = function(resourceList, field) {
        return checkSorting(resourceList, field, function(previous, next) {
            return previous <= next;
        });
    };

    corbelTest.resources.checkSortingDesc = function(resourceList, field) {
        return checkSorting(resourceList, field, function(previous, next) {
            return previous >= next;
        });
    };

    function checkSorting(resourceList, field, compareFunction) {
        var lastValue = getProperty(resourceList[0], field);
        return resourceList.every(function(resource) {
            return compareFunction(lastValue, getProperty(resource, field)) ?
                (lastValue = getProperty(resource, field)) === lastValue : false;
        });
    }

    function getProperty(obj, prop) {
        var parts = prop.split('.'),
            last = parts.pop(),
            length = parts.length,
            count = 1,
            current = parts[0];

        if (length === 0) {
            return obj[prop];
        }

        while ((obj = obj[current]) && count < length) {
            current = parts[count];
            count++;
        }

        if (obj) {
            return obj[last];
        }
    }
})();
