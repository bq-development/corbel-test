var $ = require('jquery');
var that; //jQuery 'this' scopes' fix.

var Sidebar = function Sidebar(localConfig) {
	this.localConfig = localConfig;
	that = this;
};

Sidebar.prototype = {

	menuRemoteChanged: function(evt) {
	    var environment = evt.target.value;
	    that.localConfig.setEnvironment(environment);
        //Grep's query string changes, so does the page reloads
    	if(environment!=='prod'){
		    location.reload();
    	}
        $(document).trigger('environment:changed', { 
        	environment: environment
        });
	},

	menuPropertyChanged: function(evt) {
	    var service = evt.target.name;
	    if (evt.target.checked) {
	        that.localConfig.removeLocalService(service);
	    } else {
	        that.localConfig.addLocalService(service);
	    }
	    setTimeout(function() {
	        location.reload();
	    }, 1000);
	},

	setup: function(localServices, environment) {

	    $('body').prepend('<div id="menu">PREPEND</div>');
	    $('#menu').load('base/test/menu/html/menu.html', function() {
	        $('select[name=remote] option[value=' + environment + ']').prop('selected', true);
	        $(document).on('change', 'select[name=remote]', that.menuRemoteChanged);
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
	        $(document).on('change', '.onoffswitch-checkbox', that.menuPropertyChanged);
	    });
	}
};

exports.Sidebar = Sidebar;
