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
	    location.reload();
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
	        // $('select[name=remote] option[data-suffix=-' + environment + ']').prop('selected', true);
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
