"use strict";
// ;
var module = (!(module)) ? { exports: {  } } : module;
var exports = module.exports;
"use strict";
// ;
var module = (!(module)) ? { exports: {  } } : module;
var exports = module.exports;
var pLift = (function pLift$(f) {
  /* p-lift src/macros/promise.sibilant:10:0 */

  return (x, i, a) => {
  	
    return Promise.resolve(x).then((x) => {
    	
      return f(x, i, a);
    
    });
  
  };
});
var mapPromiseParalell = (function mapPromiseParalell$(a, f) {
  /* map-promise-paralell src/macros/promise.sibilant:19:0 */

  return Promise.all(a.map(pLift(f)));
});
var reduceAll = (function reduceAll$(a, f, init) {
  /* reduce-all src/macros/promise.sibilant:24:0 */

  return a.reduce((promise, x, k) => {
  	
    return promise.then((result) => {
    	
      return f(result, x, k, a);
    
    });
  
  }, Promise.resolve((init || null)));
});
var mapPromiseSerial = (function mapPromiseSerial$(a, f) {
  /* map-promise-serial src/macros/promise.sibilant:31:0 */

  return reduceAll(a, (resArr, x, k) => {
  	
    return Promise.resolve(f(x, k, a)).then((x) => {
    	
      resArr.push(x);
      return resArr;
    
    });
  
  }, []);
});
var chainPromise = (function chainPromise$(value, funcs) {
  /* chain-promise src/macros/promise.sibilant:40:0 */

  return funcs.reduce((result, f, i) => {
  	
    return result.then(f);
  
  }, Promise.resolve(value));
});
// ;
var Type = require("./type");
var JSONType = Type.Constructor((function JSONType$(source) {
  /* JSONType src/macros/defs.sibilant:106:29 */

  Type.call(this, source);
  return this;
})).evented({
  load: (function() {
    /* src/lib/types/json.sibilant:11:22 */
  
    return chainPromise(null, [ (future) => {
    	
      return this._source.getContent();
    
    }, (future) => {
    	
      return this._data = JSON.parse(future.toString());
    
    } ]);
  }),
  save: (function(val) {
    /* src/lib/types/json.sibilant:15:22 */
  
    return this._source.setContent(JSON.stringify((val || this._data)));
  }),
  set: (function(k, v) {
    /* src/lib/types/json.sibilant:17:21 */
  
    return chainPromise(null, [ (future) => {
    	
      return this.load();
    
    }, (future) => {
    	
      return future[k] = v;
    
    } ]);
  })
});
module.exports = JSONType;