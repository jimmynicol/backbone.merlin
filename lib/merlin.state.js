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