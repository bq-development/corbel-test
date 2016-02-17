var _ = require('lodash');

var LocalConfig = function Local() {
    this.LOCAL_STORAGE_KEY = 'config';
    this.db = this.load() || {};
};

LocalConfig.prototype = {

    setOriginalURL: function(url) {
        this.db.URL_BASE_ORIGINAL = url;
        this.save();
    },

    getOriginalUrl: function() {
        return this.db.URL_BASE_ORIGINAL;
    },

    setEnvironment: function(env) {
        this.db.ENV = env;
        this.save();
    },

    getEnvironment: function() {
        return this.db.ENV;
    },

    setLocalServices: function(services) {
        this.db.localServices = services;
        this.save();
    },

    getLocalServices: function() {
        return this.db.localServices;
    },

    removeLocalService: function(service) {
        this.db.localServices = _.without(this.db.localServices, service);
        this.save();
    },

    addLocalService: function(service) {
        this.db.localServices = this.db.localServices || [];
        this.db.localServices.push(service);
        this.save();
    },

    save: function() {
        window.sessionStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.db));
    },

    load: function() {
        return JSON.parse(window.sessionStorage.getItem(this.LOCAL_STORAGE_KEY));
    }
};

exports.LocalConfig = new LocalConfig();
