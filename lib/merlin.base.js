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