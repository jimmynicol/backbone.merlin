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