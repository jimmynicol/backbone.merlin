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
  extends: function(child, parent) {
    'use strict';

    var __hasProp = {}.hasOwnProperty;

    for (var key in parent) {
      if (__hasProp.call(parent, key)) {
        child[key] = parent[key];
      }
    }

    function Ctor() { this.constructor = child; }
    Ctor.prototype = parent.prototype;
    child.prototype = new Ctor();
    child._super = parent.prototype;

    return child;
  }

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
      return this.constructor.name || 'something';
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

    this.log('something something');
  }

  _.extend(Base.prototype,
    Backbone.Merlin.Slide.prototype, // mixin the slide functionality
    Backbone.Merlin.Log.prototype,   // add some logging features
    {}
  );

  return Base;

})(Backbone, Backbone.$, _);
// merlin.state.js

Backbone.Merlin.State = (function(Backbone, $, _){
  'use strict';


  var State = function(options){
    // run the parent constructor of the Backbone.View
    State._super.constructor.apply(this, arguments);

    this.options      = _.extend(this.defaultOptions(), options);
    this.wizard       = this.wizard || this.options.wizard;
    this.currentState = 'init';
    this._initialised = false;

    // this.el = this.options.el || (this.stateName() + '-state');

    if (this.options.model) {
      this.model = this.options.model;
    }

    this.renderLayout();
    this.transitionListeners();

    if (this.options.renderOnInit === true){
      this.trigger('init');
    }

    this.log('State initialised!');

  };

  // extend the State prototype with Backbone View
  Backbone.Merlin.extends(State, Backbone.View);

  // add the rest of the methods along with the logging mixin
  _.extend(State.prototype, Backbone.Merlin.Log.prototype, {

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
      this.$el
        .html(this.layoutView())
        .addClass('view-state');
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
    renderViews: function(){
      this.log('rendering ' + this.stateName() + ' views');
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


  //   @on 'remove', =>
  //     @log 'removed triggered'
  //     @remove arguments...

  //   # render the init state on load if required
  //   @trigger 'init' if @options.renderOnInitialisation


  // renderLayout: ->
  //   @wizard
  //     .workspace()
  //     .append @base_template state: @el.replace('#','')
  //   @$el = ($ @el)
  //   @$el.addClass 'view-state'


  // # Views to initialise, listed by the selector target
  // views: {}
  // renderViews: ->
  //   @log "rendering '#{@stateName()}' views"

  //   # render the specific view that contains the state layout
  //   if @layout_view?
  //     @layout_view = new @layout_view
  //       el: @el
  //       model: @model
  //       state: @
  //       wizard: @wizard
  //       log: => @log arguments...

  //   for el, view of @views
  //     if el isnt @el and @$(el).length is 0
  //       throw "Merlin: Cannot initialize state's view: the element selector '#{el}' was not found in the state's layout container. Make sure the selector matches the state's layout container '#{@el}', or the selector can be found from the previously rendered views. (element selector: '#{el or ''}', state name: '#{@stateName()}')"

  //     # initialise the view and replace the class reference with an instance
  //     @views[el] = new view
  //       el: el
  //       model: @model
  //       state: @
  //       wizard: @wizard
  //       log: => @log arguments...

  // # Convenience method for finding elements within the state
  // $: (selector) -> @$el.find selector

  // # Stub methods for the transition handlers
  // beforeInit: ->
  // init: ->
  // show: ->
  // hide: ->
  // remove: ->
  // isComplete: -> false
  // isBlocked: -> false


  // # Display overrides for the state name. Basically so that we can update the
  // # name shown in the url and/or the navbar without messing with other code.
  // friendlyName: -> @stateName()
  // displayState: -> @makeUrlFriendly @friendlyName()


  // # Take a str (most likely a friendlyName) and make it nice for URLs
  // makeUrlFriendly: (str) ->
  //   str.toLowerCase()
  //     .replace(/[^a-z0-9\s]/g, '')
  //     .replace(/(\s\s|\s)/gi, '-')


  // # Show and/or create a state specific overlay
  // showOverlay: (speed='fast') ->
  //   if @$('> .overlay').length is 0
  //     @$el.append '<div class="overlay"></div>'
  //   @$('> .overlay').fadeIn speed


  // # Hide the overlay
  // hideOverlay: (speed='fast') -> @$('> .overlay').fadeOut speed


  return State;

})(Backbone, Backbone.$, _);
// merlin.connector.js


// CommonJS connector
if(typeof exports !== 'undefined'){
  module.exports = Backbone.Merlin;
}