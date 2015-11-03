'use strict';

var _ = require('underscore');

var memory = {};

var get = function(req, res) {
    res.json ( memory[req.params.id] || {} );
};


var post = function(req, res) {
    if (!memory[req.params.id]) {
    	memory[req.params.id] = {};
    }
    _.extend(memory[req.params.id], req.body);
    res.json();
};


function setup(app) {
    app.get('/localStorage/:id', get);
    app.post('/localStorage/:id', post);
    
}

module.exports = setup;
