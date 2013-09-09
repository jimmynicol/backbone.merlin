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