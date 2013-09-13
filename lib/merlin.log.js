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