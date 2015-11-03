'use strict';
/* global exports */


var locators = {
	google: {
		loginTrigger: {id: 'login-google'},
		username: {id: 'Email'},
        password: {id: 'Passwd'},
        login: {id: 'signIn'},
        aprove: {id: 'submit_approve_access'}
	},
	facebook: {
		loginTrigger: {id: 'login-facebook'},
		username: {id: 'email'},
        password: {id: 'pass'},
        login: {id: 'loginbutton'},
        aprove: {id: '__CONFIRM__'}
	},
	loginResponse: {id: 'login-response'},
	registerResponse: {id: 'register-response'},
	username: {id: 'username'},
	firstName: {id: 'firstName'},
	lastName: {id: 'lastName'},
	email: {id: 'email'},
	remember: {id: 'remember'},
	avatar: {className: 'avatar'},
	avatarImage: {css: '.avatar img'}
};

exports.locators = locators;