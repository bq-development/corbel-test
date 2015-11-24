var _ = require('lodash');
var common = require('./common');
var fixtures = require('./fixtures');
var config = require('../.tmp/config.js');
var corbelTest = {};

var getEnvironment = function(config, process, karma){
	if(karma.config.env && karma.config.env!==undefined){
		return karma.config.env;
	} else{
		return process.env.NODE_ENV ? process.env.NODE_ENV : config.ENV;
	}
};

var getLocalServices = function(karma){
	return (karma.config.localServices) ? karma.config.localServices.match(/(^\[(((.)+(,)?)+)\]$)/)[2].split(',') : [];
};

corbelTest.CONFIG = _.cloneDeep(config);

//Initialize correct urlBase
var karma = window.__karma__;
var environment = getEnvironment(config, process, karma);
corbelTest.CONFIG.COMMON.urlBase = config.COMMON.urlBase.replace('{{ENV}}', environment);

corbelTest.getConfig = function(clientName) {
	var localServices = getLocalServices(karma);
    var data = {
        urlBase: corbelTest.CONFIG.COMMON.urlBase,
        localServices: localServices
    };
    _.each(Object.keys(corbelTest.CONFIG.COMMON.endpoints),function(service){
    	if( _.contains(localServices,service) ){
	    	data[service+'Endpoint'] = corbelTest.CONFIG.COMMON.endpoints[service];
    	}
    });

    return _.extend(data, corbelTest.CONFIG[clientName]);
};

corbelTest.common = common;
corbelTest.fixtures = fixtures;
corbelTest.drivers = common.clients.drivers;

window.corbelTest = corbelTest;
