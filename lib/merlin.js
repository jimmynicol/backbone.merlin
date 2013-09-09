// merlin.js

// Import Backbone if it isnt already in place
var Backbone = this.Backbone;
if (!Backbone){
  if(typeof exports !== 'undefined'){
    Backbone = require('backbone');
  }
}

// Import Underscore if it isnt already in place
var _ = this._;
if (!_){
  if(typeof exports !== 'undefined'){
    _ = require('underscore');
  }
}

// Initialise the Merlin namespace
Backbone.Merlin = {};