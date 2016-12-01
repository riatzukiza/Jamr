var fun = require("../functional");
var map = fun.functors.object.map;
var merge = fun.functors.object.merge;
var is = fun.predicates;
Function.prototype.pset = function(k,f) {
    this.prototype[k] = f;
    return this;
}
Function.prototype.pdescribe = function(o) {
    o.map((x,k) => this.pset(k,x));
    return this;
}
Function.prototype.pdefine = function(o) {
    o.forEach((x,k) => {
        Object.defineProperty(this.prototype,k,{
            value:x,
            writable:true,
            configurable:true,
        })
    })
}
