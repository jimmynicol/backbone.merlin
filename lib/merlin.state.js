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