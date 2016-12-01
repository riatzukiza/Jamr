"use strict";
// ;
// this.x.bind(this, a, b, c, d)// this.x.bind(this, a, b, c, d);
var Interface = require("../interface.js").Interface,
    obj = require("../wrappers/object.js"),
    EventEmitter = require("events").EventEmitter,
    prom = require("../wrappers/promise.js"),
    is = require("../functional/predicates.js"),
    maybe = require("../functional/logical.js").maybe.unary();
var promisedMethod = (function promisedMethod$(args) {
  /* promisedMethod src/lib/events/EventInterface.sibilant:9:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  var s = args.pop(),
      v = args.pop();
  return prom.resolve();
});
var eventedMethod = (function eventedMethod$(args) {
  /* eventedMethod src/lib/events/EventInterface.sibilant:13:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  var s = args.pop(),
      v = args.pop();
  return prom.resolve(v).then((x) => {
  	
    this.emit.apply(this, [ s, x ].concat(args));
    return x;
  
  }).catch((e) => {
  	
    this.emit("error", e, args);
    throw e
  
  });
});
var p_emit = EventEmitter.prototype.emit;
var emit = (function emit$(args) {
  /* emit src/lib/events/EventInterface.sibilant:21:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  p_emit.apply(this, [ "*" ].concat(args));
  return p_emit.apply(this, args);
});
var EventInterface = Interface.Constructor((function EventInterface$(e, listeners) {

  this._emitter = (is.instanceof(EventEmitter, e)) ? e : (new EventEmitter());
  this._emitter.emit = emit;
  this._bubbleTargets = [];
  return this;
})).fluent({
  on: (function(name, f) {
    /* src/lib/events/EventInterface.sibilant:33:13 */
  
    return this._emitter.on(name, f);
  }),
  once: (function(name, f) {
    /* src/lib/events/EventInterface.sibilant:34:13 */
  
    return this._emitter.once(name, f);
  }),
  emit: (function() {
    /* src/lib/events/EventInterface.sibilant:35:13 */
  
    this._emitter.emit.apply(this._emitter, arguments);
    return this;
  }),
  removeListener: (function() {
    /* src/lib/events/EventInterface.sibilant:36:23 */
  
    return this._emitter.removeListener.apply(this._emitter, arguments);
  })
}).methods({
  _bubble: (function(emitter) {
    /* src/lib/events/EventInterface.sibilant:39:8 */
  
    return (function() {
      /* src/lib/events/EventInterface.sibilant:39:21 */
    
      (function() {
        if (is.function(f)) {
          return args = f.apply(this, arguments);
        }
      }).call(this);
      return emitter.emit.apply(emitter, arguements);
    });
  }),
  bubbleTo: (function(emitter, f) {
    /* src/lib/events/EventInterface.sibilant:42:8 */
  
    this.on("*", this._bubble(emitter));
    this._bubbleTargets.push(emitter);
    return this;
  }),
  handlers: (function(h) {
    /* src/lib/events/EventInterface.sibilant:45:17 */
  
    return obj.forEach((f, k) => {
    	
      return this.on(k);
    
    });
  }),
  _emitSuccess: (function(success, fail) {
    /* src/lib/events/EventInterface.sibilant:47:8 */
  
    return (function() {
      if ((function() {
        /* src/macros/defs.sibilant:156:8 */
      
        return (new Promise((success, fail) => {
        	
          var resolve = success,
              reject = fail;
          return 1;
        
        }));
      })) {
        return success(arguments);
      } else {
        return success(arguments[0]);
      }
    }).call(this);
  }),
  when: (function(event) {
    /* src/macros/defs.sibilant:156:8 */
  
    return (new Promise((success, fail) => {
    	
      var resolve = success,
          reject = fail;
      return this.once(event, this._emitSuccess(success, fail));
    
    }));
  })
}).static({
  evented: (function(obj) {
    /* src/lib/events/EventInterface.sibilant:53:18 */
  
    return this.methodsAfter(obj, eventedMethod);
  }),
  eventedMethod: (function(s, f) {
    /* src/lib/events/EventInterface.sibilant:54:23 */
  
    return this.after(s, f);
  })
});
module.exports = EventInterface;
