//@exclude
'use strict';
/*globals corbel */
//@endexclude

var superagent = require('superagent');

var createdQueryObject = [];
var createdRelationObject = [];

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

var relationSuccessHandler = function(list, collectionA, idA, collectionB, idB) {
    list.push({
        collectionA: collectionA,
        idA: idA,
        collectionB: collectionB,
        idB: idB
    });
};

function createdObjectsToQuery(driver, collectionName, amount, extraField) {
    var promises = [];
    var year = 2015;
    var month = 6;

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
            randomField: 'asdf'
        };

        if(extraField) {
            json.extra = extraField;
        }

        var promise = driver.resources.collection(collectionName).add(json);
        promises.push(promise);
        promise.then(successHandler.bind(this, createdQueryObject, collectionName)); //jshint ignore: line
    }
    return Promise.all(promises);
}

function cleanResourcesQuery(driver) {
    var promises = [];
    createdQueryObject.forEach(function(entry) {
        var promise = driver.resources.resource(entry.collection, entry.id).delete();
        promises.push(promise);
    });
    createdQueryObject = [];
    return Promise.all(promises);
}

function checkSortingAsc(resourceList, field) {
    return checkSorting(resourceList, field, function(previous, next) {
        return previous <= next;
    });
}

function checkSortingDesc(resourceList, field) {
    return checkSorting(resourceList, field, function(previous, next) {
        return previous >= next;
    });
}

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

function getResource(token, collection, query) {
    
    var promise = new Promise(function(resolve, reject){
        var url = corbelTest.CONFIG.COMMON.urlBase.replace('{{module}}', 'resources') + 'resource/' + collection;
    
        if(query){
            url += '?' + query;
        }
        
        superagent
            .get(url)
            .set('Authorization', 'Bearer ' + token)
            .set('Accept', 'application/json')
            .end(function(err, response){
                if(!err){
                    resolve(response);
                }else{
                    reject(err);
                }
            });
    });

    return promise;
    
    
}

function createRelationFromSingleObjetToMultipleObject(driver, collectionA, idResourceInA, collectionB, idResourceInB) {
        var promises = [];

        idResourceInB.forEach(function(idB, count) {
            var jsonRelationData = {
                intField: Date.now(),
                intCount: 100 * count,
                stringField: 'stringContent' + count,
                stringSortCut: 'Test Short Cut',
                ObjectNumber: createIntegerSecuence(count)
            };

            var promise = driver.resources.relation(collectionA, idResourceInA, collectionB).add(idB, jsonRelationData);
            promises.push(promise);
            promise.then(relationSuccessHandler.bind
                    (this, createdRelationObject, collectionA, idResourceInA, collectionB, idB));
        });

        return Promise.all(promises);
}

module.exports = {
    getResource : getResource,
    getProperty : getProperty,
    checkSorting : checkSorting,
    checkSortingDesc : checkSortingDesc,
    createdObjectsToQuery : createdObjectsToQuery,
    cleanResourcesQuery: cleanResourcesQuery,
    checkSortingAsc: checkSortingAsc,
    createRelationFromSingleObjetToMultipleObject : createRelationFromSingleObjetToMultipleObject
};
