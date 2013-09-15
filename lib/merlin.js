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
Backbone.Merlin = {

  // shamelessly lifted from Coffeescript's compiler
  // extends: function(child, parent) {
  //   'use strict';

  //   var __hasProp = {}.hasOwnProperty;

  //   for (var key in parent) {
  //     if (__hasProp.call(parent, key)) {
  //       child[key] = parent[key];
  //     }
  //   }

  //   function Ctor() { this.constructor = child; }
  //   Ctor.prototype = parent.prototype;
  //   child.prototype = new Ctor();
  //   child._super = parent.prototype;

  //   return child;
  // }

};