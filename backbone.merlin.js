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
// merlin.log.js


Backbone.Merlin.Log = (function(_){
  'use strict';

  function Log(){}

  _.extend(Log.prototype, {

    canLog: function(){
      if (this._canLog === true){
        return this._canLog;
      }

      if (/log=/.test(window.location.search)){
        if (typeof console !== 'undefined'){
          this._canLog = true;
          return true;
        }
      }

      return false;
    },

    logName: function(){
      return this.constructor.name || this.stateName();
    },

    log: function(){
      var slice, args;

      if (!this.canLog()){
        return;
      }

      slice = [].slice;
      args  = [this.logName() + ':'].concat(slice.call(arguments));

      console.log.apply(console, args);
    }

  });

  return Log;

})(_);
// merlin.base.js


Backbone.Merlin.Base = (function(Backbone, $, _){
  'use strict';


  function Base(options){
    this.options = options || {};
    this.$el = $(this.options.el);

    this.options.startOnInit = this.options.startOnInit || true;

    this.routes = {};
    this.initialisedStates = [];
    this.stateNames = [];

    this.log('Merlin Initialized');
  }

  _.extend(Base.prototype,
    Backbone.Merlin.Slide.prototype, // mixin the slide functionality
    Backbone.Merlin.Log.prototype,   // add some logging features
    {
      $: function(selector){
        return this.$el.find(selector);
      },

      // Placeholder for the state
      states: {},

      // Register all the listed states
      registerStates: function(){
        var _this = this;

        this.initialisedStates = _.map(this.states, function(State, i){
          var newState, name;

          // initialize a state
          newState = new State({
            model: _this.model(),
            wizard: _this
          });

          // find the routing name
          name = newState.displayName();

          // keep a list of the state names for use elsewhere
          this.stateNames.push(name);

          // if this is first state then add it as the root path
          if (i === 0){
            _this.routes[''] = name;
          }

          // add the path and any sub-paths
          _this.routes[name] = name;
          _this.routes['' + name + '/*path'] = name;

          _this.log('\'' + name + '\' state registered');
          return newState;
        });
      },

      buildRouter: function(){
        var _this = this;

        this.router = new Backbone.Router({routes: this.routers});

        // load helper routes for advancing to next/previous routes
        this.router('next', 'next');
        this.router('prev', 'prev');

        Backbone.history.on('route', function(router, state, args){
          switch(state){
          case 'next':
            _this.nextState();
            break;
          case 'prev':
            _this.prevState();
            break;
          default:
            if (_.indexOf(_this.stateNames, state) > -1){
              this.stateChange(state, args[0][0]);
            }
          }
        });

        if (this.options.startOnInit){
          Backbone.history.start();
        }
      },

      // stateChange: function(stateName, path){

      // },

      extend: function(){ return _.extend; }
    }
  );

  return Base;

})(Backbone, Backbone.$, _);
// merlin.state.js

Backbone.Merlin.State = (function(Backbone, $, _){
  'use strict';


  var State = Backbone.View.extend({

    constructor: function (options){
      // run the parent constructor of the Backbone.View
      /* jshint camelcase:false */
      State.__super__.constructor.apply(this, arguments);
      /* jshint camelcase:true */

      this.options      = _.extend(this.defaultOptions(), options);
      this.wizard       = this.wizard || this.options.wizard;
      this.currentState = 'init';
      this._initialised = false;

      if (this.options.model) {
        this.model = this.options.model;
      }

      this.renderLayout();
      this.transitionListeners();

      if (this.options.renderOnInit === true){
        this.trigger('init');
      }

      this.log('State initialised!');
    },

    defaultOptions: function(){
      return {
        renderOnInitialisation: false,
        transitions: ['init', 'show', 'hide', 'remove']
      };
    },

    // Determine a name for the state, this must be overridden. FYI this
    // method is not called 'name' due to collisions with existing methods,
    // params
    stateName: function(){
      throw 'Not implemented: this state needs a name!';
    },

    // Render the base layout for the view, this is required
    renderLayout: function(){
      if (!this.layoutView){
        throw 'A state needs a layout view to render';
      }
      this.$el.html(this.layoutView()).addClass('view-state');
    },

    // Add some listeners for the each of the transitions
    transitionListeners: function(){
      var _this = this;

      this.on('init', function(){
        _this.log('init triggered');
        _this.beforeInit.apply(_this, arguments);
        _this.renderViews();
        _this.init.apply(_this, arguments);
        _this._initialised = true;
      });

      this.on('show', function(){
        if (!_this._initialised){
          _this.beforeInit.apply(_this, arguments);
          _this.renderViews();
          _this.init.apply(_this, arguments);
          _this._initialised = true;
        }
        _this.$el.addClass('show');
        _this.$el.removeClass('hide');
        _this.show.apply(_this, arguments);
      });

      this.on('hide', function(){
        _this.$el.addClass('hide');
        _this.$el.removeClass('show');
        _this.hide.apply(_this, arguments);
      });
    },

    // Views to initialise, listed by the selector target
    views: {},

    // Render each of the listed views
    renderViews: function(){
      var _this = this;

      this.log('rendering ' + this.stateName() + ' views');

      _.forEach(this.views, function(View, elem){
        this.views[elem] = new View({
          el: elem,
          model: this.model,
          state: this,
          wizard: this.wizard,
          log: function(){ _this.log.apply(this, arguments); }
        });
      });
    },

    // Take a str (most likely a friendlyName) and make it nice for URLs
    makeUrlFriendly: function(str){
      return str.toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/(\s\s|\s)/gi, '-');
    },

    // Stub methods for the transition handlers
    beforeInit: function(){},
    afterInit:  function(){},
    show:       function(){},
    hide:       function(){},
    remove:     function(){},
    isComplete: function(){ return false; },
    isBlocked:  function(){ return false; },
  });


  // Mixin the logging
  _.extend(State.prototype, Backbone.Merlin.Log.prototype);


  return State;

})(Backbone, Backbone.$, _);
// merlin.connector.js


// CommonJS connector
if(typeof exports !== 'undefined'){
  module.exports = Backbone.Merlin;
}