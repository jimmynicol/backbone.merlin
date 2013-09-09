/*
-------------------
Backbone.Merlin
-------------------

v0.0.1

Copyright (c) 2013: James Nicol <james.andrew.nicol@gmail.com>
Distributed under MIT license

http://github.com/jimmynicol/backbone.merlin
*/

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
// merlin.slider.js


Backbone.Merlin.Slide = (function($, _){
  'use strict';

  function Slide(){}

  _.extend(Slide.prototype, {

    // List all the vendored properties we need for the slidering
    cssProperties: {
      transform: [
        'webkitTransform', 'MozTransform', 'msTransform', 'OTransform'
      ],
      transitionDuration: [
        'webkitTransitionDuration', 'MozTransitionDuration',
        'msTransitionDuration', 'OTransitionDuration', 'transitionDuration'
      ],
      transitionEnd: [
        'webkitTransitionEnd', 'otransitionend', 'oTransitionEnd',
        'msTransitionEnd', 'transitionend'
      ]
    },

    // Determine if the browser is capable of CSS transforms
    canCssTransform: function() {
      var b, s, flag;

      b = document.body || document.documentElement;
      s = b.style;

      // No css support detected
      if (typeof s === 'undefined') { return false; }

      // Tests for vendor specific transform
      flag = false;
      _.forEach(this.cssProperties.transform, function(prop){
        if (typeof s[prop] === 'string'){ flag = true; }
      });

      return flag;
    },

    smoothSlide: function(opts){
      var slider, distance, direction, speed, translations;

      if (typeof opts === 'undefined'){
        opts = {};
      }

      if(!opts.slider || !opts.distance){
        throw 'To slide the component needs a slider and distance property';
      }

      slider   = $(opts.slider);
      distance = opts.distance;

      // set some defaults
      direction = opts.direction || 'x';
      speed     = opts.direction || '300';

      // determine all the translation strings
      translations = this.setTranslations(direction, distance);

      // if the browser is not capable of transforms, simply use the animate
      // property, wont look great but it will work.
      if (!this.canCssTransform()) {
        slider.animate(translations.moveMargin, speed, opts.callback);
        return;
      }

      // set the transition duration
      _.forEach(this.cssProperties.transitionDuration, function(prop){
        slider.css(prop, '' + speed + 'ms');
      });

      // if there is a callback attach it once to the slider
      if (opts.callback) {
        slider.one(
          this.cssProperties.transitionEnd.join(' '), opts.callback
        );
      }

      // apply the vendored transforms
      _.forEach(this.cssProperties.transform.slice(0,2), function(prop){
        slider.css(prop, translations.translate3d);
      });
      _.forEach(this.cssProperties.transform.slice(2,4), function(prop){
        slider.css(prop, translations.translate);
      });
    },

    // Build an object of various translation strings based on direction
    setTranslations: function(direction, distance){
      var t = {
        moveMargin:  '',
        translate3d: '',
        translate:   ''
      };

      switch(direction){
      case 'x':
        t.moveMargin  = {'marginLeft': '' + (-distance) + 'px'};
        t.translate3d = 'translate3d(' + (-distance) + 'px,0,0)';
        t.translate   = 'translateX(' + (-distance) + 'px)';
        break;
      case 'y':
        t.moveMargin  = {'marginTop': '' + (-distance) + 'px'};
        t.translate3d = 'translate3d(0,' + (-distance) + 'px,0)';
        t.translate   = 'translateY(' + (-distance) + 'px)';
      }

      return t;
    }
  });


  return Slide;

})(Backbone.$, _);
// merlin.base.js


Backbone.Merlin.Base = (function(Backbone, $, _){
  'use strict';

  function Base(options){
    this.options = options || {};
    this.$el = $(this.options.el);
  }

  _.extend(Base.prototype,
    Backbone.Merlin.Slide.prototype, // mixin the slide functionality
    {}
  );

  return Base;

})(Backbone, Backbone.$, _);
// merlin.state.js

Backbone.Merlin.State = (function(){
  'use strict';

  function State(){
  }

  return State;

})(Backbone.$, _);
// merlin.connector.js


// CommonJS connector
if(typeof exports !== 'undefined'){
  module.exports = Backbone.Merlin;
}