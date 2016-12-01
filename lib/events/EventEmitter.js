var aprint = (function aprint$(a) {
  /* aprint src/macros/defs.sibilant:7:0 */

  var a = Array.prototype.slice.call(arguments, 0);

  return (function(b) {
    /* src/macros/defs.sibilant:8:2 */
  
    var b = Array.prototype.slice.call(arguments, 0);
  
    return console.log.apply(this, a.concat(b));
  });
});
// ;
var Interface = require("../interface.js").Interface(),
    obj = require("../wrappers/object.js"),
    EventEmitter = EventEmitter.(require("events")),
    prom = require("../wrappers/promise.js"),
    is = require("../functional/predicates.js"),
    maybe = require("../functional/logical.js").maybe.unary();
var promisedMethod = (function promisedMethod$(args) {
  /* promisedMethod src/lib/events/EventEmitter.sibilant:9:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  var s = args.pop(),
      v = args.pop();
  return prom.resolve();
});
var eventedMethod = (function eventedMethod$(args) {
  /* eventedMethod src/lib/events/EventEmitter.sibilant:13:0 */

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
var emit = (function emit$() {
  /* emit src/lib/events/EventEmitter.sibilant:21:0 */

  p_emit.call.apply(this, [ this, "*" ].concat(arguments));
  return p_emit.call.apply(this, [ this ].concat(arguments));
});
var EventInterface = Interface.Constructor((function EventInterface$(e, listeners) {
  /* EventInterface src/macros/defs.sibilant:37:29 */

  this._emitter(e, instanceof, EventEmitter, e, new, EventEmitter);
  this._emitter.emit = emit;
  this._bubbleTargets = [];
  return this;
})).methods({
  on: (function(name, f) {
    /* src/lib/events/EventEmitter.sibilant:30:20 */
  
    return this._emitter.on(name, f);
  }),
  once: (function(name, f) {
    /* src/lib/events/EventEmitter.sibilant:31:22 */
  
    return this._emitter.once(name, f);
  }),
  emit: (function() {
    /* src/lib/events/EventEmitter.sibilant:32:22 */
  
    this._emitter.emit.apply(this, arguments);
    return this;
  }),
  bubbleTo: (function(emitter, f) {
    /* src/lib/events/EventEmitter.sibilant:33:26 */
  
    this.on("*", (function(args) {
      /* src/lib/events/EventEmitter.sibilant:33:54 */
    
      var args = Array.prototype.slice.call(arguments, 0);
    
      (function() {
        if (is.function(f)) {
          return args = f.apply(this, args);
        }
      }).call(this);
      return emitter.emit.apply(this, args);
    }));
    this._bubbleTargets.push(emitter);
    return this;
  }),
  handlers: (function(h) {
    /* src/lib/events/EventEmitter.sibilant:38:26 */
  
    return obj.forEach((f, k) => {
    	
      return this.on(k);
    
    });
  }),
  when: (function(event) {
    /* src/macros/defs.sibilant:46:8 */
  
    return (new Promise((success, fail) => {
    	
      return this.once(event, (function() {
        /* src/lib/events/EventEmitter.sibilant:40:49 */
      
        return (function() {
          if (arguments.length > 1) {
            return success(arguments);
          } else {
            return success(arguments[0]);
          }
        }).call(this);
      }));
    
    }));
  })
}).static({ evented: (function(obj) {
  /* src/lib/events/EventEmitter.sibilant:45:24 */

  return this.methodsAfter(obj, eventedMethod);
}) });