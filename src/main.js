var _ = require('lodash');
var common = require('./common');
var fixtures = require('./fixtures');
var config = require('../.tmp/config.js');
var localConfigModule = require('./localConfig').LocalConfig;
var $ = require('jquery');

var corbelTest = {};

var menuRemoteChanged = function(evt) {
    var environment = evt.target.value;
    localConfigModule.setEnvironment(environment);
    location.reload();
};

var menuPropertyChanged = function(evt) {
    var service = evt.target.name;
    if (evt.target.checked) {
        localConfigModule.removeLocalService(service);
    } else {
        localConfigModule.addLocalService(service);
    }
    setTimeout(function() {
        location.reload();
    }, 1000);
};

var initEnvironment = function(config, process, karma, local) {
    if (local.getEnvironment() !== undefined) {
        return local.getEnvironment();
    } else if (karma.config.env && karma.config.env !== undefined) {
        return karma.config.env;
    } else {
        return process.env.NODE_ENV ? process.env.NODE_ENV : config.ENV;
    }
};

var initLocalServices = function(karma, local) {
    if (local.getLocalServices() !== undefined) {
        return local.getLocalServices();
    } else {
        return (karma.config.localServices) ?
            karma.config.localServices.match(/(^\[(((.)+(,)?)+)\]$)/)[2].split(',') : [];
    }
};

var setupSidebar = function(localServices, environment) {
    $('body').prepend('<div id="menu">PREPEND</div>');
    $('#menu').load('base/test/menu/html/menu.html', function() {
        $('select[name=remote] option[data-suffix=-' + environment + ']').prop('selected', true);
        $(document).on('change', 'select[name=remote]', menuRemoteChanged);
    });

    $.get('base/test/menu/html/switch.html').then(function(switchTemplate) {

        _.each(Object.keys(corbelTest.CONFIG.COMMON.endpoints), function(service) {

            var state = _.contains(localServices, service);

            var configureButton = {
                ShowName: service,
                Name: service,
                optionOn: 'remote',
                optionOff: 'local',
                checked: state ? '' : 'checked'
            };
            var template = _.template(switchTemplate);
            $('#options').append(template(configureButton));

        });
        $(document).on('change', '.onoffswitch-checkbox', menuPropertyChanged);
    });
};

var setupGrep = function(karma) {
    if (karma.config.grep) {
        var debugHref = $(parent.document).find('a.btn-debug').attr('href');
        $(parent.document).find('a.btn-debug').attr('href', debugHref + '?grep=' + karma.config.grep);
    }
};

var setupBrowser = function(karma, localServices, environment) {
    if (window.chrome) {
        setupGrep(karma);
        setupSidebar(localServices, environment);
    }
};

var saveLocalConfig = function(environment, localServices) {
    localConfigModule.setEnvironment(environment);
    localConfigModule.setLocalServices(localServices);
};

corbelTest.CONFIG = _.cloneDeep(config);

var karma = window.__karma__;
var environment = initEnvironment(config, process, karma, localConfigModule);
var localServices = initLocalServices(karma, localConfigModule);
corbelTest.CONFIG.COMMON.urlBase = config.COMMON.urlBase.replace('{{ENV}}', environment);

saveLocalConfig(environment, localServices);
setupBrowser(karma, localServices, environment);

corbelTest.getConfig = function(clientName) {
    var data = {
        urlBase: corbelTest.CONFIG.COMMON.urlBase,
        localServices: localServices
    };
    _.each(Object.keys(corbelTest.CONFIG.COMMON.endpoints), function(service) {
        if (_.contains(localServices, service)) {
            data[service + 'Endpoint'] = corbelTest.CONFIG.COMMON.endpoints[service];
        }
    });

    return _.extend(data, corbelTest.CONFIG[clientName]);
};

corbelTest.localConfig = localConfigModule;
corbelTest.common = common;
corbelTest.fixtures = fixtures;
corbelTest.drivers = common.clients.drivers;

window.corbelTest = corbelTest;
