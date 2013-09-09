// merlin.state.js

Backbone.Merlin.State = (function(Backbone, $, _){
  'use strict';

  function State(options){
    this.options      = _.extend(this.defaultOptions(), options);
    this.wizard       = this.wizard || this.options.wizard;
    this.currentState = 'init';
    this._initialised = false;
    // this.baseTemplate

    @el = $(@options.el || (@stateName() + '-state'))

    if (this.options.model) this.model = this.options.model;
  }

  _.extend(State.prototype
    Backbone.Events,
    {
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
        throw 'Not implemented: this state needs a name!'
      },
    }
  );


  constructor: (options) ->

    # set the target element for the state
    @el = "##{@options.el or @stateName()}-state"

    # assign the base wizard as a variable
    @wizard = @wizard or @options.wizard

    @renderLayout()
    @transitionListeners()

    @log "view state initialised!"


  transitionListeners: ->
    # setup some event listeners for each of the transitions
    @on 'init', =>
      @log "init triggered"
      @beforeInit arguments...
      @renderViews()
      @init arguments...
      @_initialised = true

    @on 'show', =>
      unless @_initialised
        @beforeInit arguments...
        @renderViews()
        @init arguments...
        @_initialised = true
      @$el.addClass 'show'
      @$el.removeClass 'hide'
      @show arguments...

    @on 'hide', =>
      @$el.addClass 'hide'
      @$el.removeClass 'show'
      @hide arguments...

    @on 'remove', =>
      @log 'removed triggered'
      @remove arguments...

    # render the init state on load if required
    @trigger 'init' if @options.renderOnInitialisation


  renderLayout: ->
    @wizard
      .workspace()
      .append @base_template state: @el.replace('#','')
    @$el = ($ @el)
    @$el.addClass 'view-state'


  # Views to initialise, listed by the selector target
  views: {}
  renderViews: ->
    @log "rendering '#{@stateName()}' views"

    # render the specific view that contains the state layout
    if @layout_view?
      @layout_view = new @layout_view
        el: @el
        model: @model
        state: @
        wizard: @wizard
        log: => @log arguments...

    for el, view of @views
      if el isnt @el and @$(el).length is 0
        throw "Merlin: Cannot initialize state's view: the element selector '#{el}' was not found in the state's layout container. Make sure the selector matches the state's layout container '#{@el}', or the selector can be found from the previously rendered views. (element selector: '#{el or ''}', state name: '#{@stateName()}')"

      # initialise the view and replace the class reference with an instance
      @views[el] = new view
        el: el
        model: @model
        state: @
        wizard: @wizard
        log: => @log arguments...

  # Convenience method for finding elements within the state
  $: (selector) -> @$el.find selector

  # Stub methods for the transition handlers
  beforeInit: ->
  init: ->
  show: ->
  hide: ->
  remove: ->
  isComplete: -> false
  isBlocked: -> false


  # Display overrides for the state name. Basically so that we can update the
  # name shown in the url and/or the navbar without messing with other code.
  friendlyName: -> @stateName()
  displayState: -> @makeUrlFriendly @friendlyName()


  # Take a str (most likely a friendlyName) and make it nice for URLs
  makeUrlFriendly: (str) ->
    str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/(\s\s|\s)/gi, '-')


  # Show and/or create a state specific overlay
  showOverlay: (speed='fast') ->
    if @$('> .overlay').length is 0
      @$el.append '<div class="overlay"></div>'
    @$('> .overlay').fadeIn speed


  # Hide the overlay
  hideOverlay: (speed='fast') -> @$('> .overlay').fadeOut speed




  return State;

})(Backbone, Backbone.$, _);