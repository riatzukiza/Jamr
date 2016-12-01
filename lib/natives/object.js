"use strict";
var fun = require("../functional");
var map = fun.functors.object.map;
var merge = fun.functors.object.merge;
var is = fun.predicates;
require("./function.js");
Object.pdescribe(map(fun.functors.object, (x,k) =>
    function() {
        return x(this,...arguments)
    }));
Object.pdefine({
    always(f) {
        //console.log("always");
        return this.then(f,f);
    },
    /*then(f,g) {
        console.trace("object.then");
        if(is.function(f)) {
            try {
                return f(this);
            } catch(err) {
                if(is.function(g)) {
                    try {
                        return g(err);
                    } catch(err) {
                        return err;
                    }
                }
                return err;
            }
        }
        return this;
    },*/
    catch(g) {
        return this.then(null,g);
    },
    filter(f) {
        var r = {};
        var o = this;
        for(let i in o )
            if(f(o[i],i)) r[i] = o[i];
        return r;
    },
    keys() {
        return Object.keys(this);
    },
    forEachKey(f) {
        return this.keys().forEach(f);
    },
    promiseAll() {
        return new Promise((s, f) => {
            var o = {};
            var keys = Object.keys(this);
            var pending = keys.length;
            var fail = false;
            var d = (p, i) => {
                var fx = x => {
                    o[i] = x;
                    if (!--pending && !fail) {
                        s(o);
                    }
                };
                var fe = e => {
                    fail = true;
                    f(e);
                };
                return p .then(fx) .catch(fe);
            };
            return this.map(d);
        });
    },
    filter_reduce(ff, fr, v) {
        let o = this;
        for (let i in o)
            if (ff(o[i])) v = fr(v, o[i], i, o);
        return v;
    },
    map(f) {
        var r = {};
        let o = this;
        for (let i in o)
            r[i] = f(o[i], i, o);
        return r;
    },
    mapOwn(f) {
        var o = this;
        var r = Object.create(o);
        Object.keys(o).forEach((k) => r[k] = f(o[k],k,o));
        return r;
    },
    map_reduce(fm, fr, v) {
        let o = this;
        for (let i in o) v = fr(v, fm(o[i], i, o), i, o);
        return v;
    },
    forEach(f) {
        let o = this;
        for (let i in o) f(o[i], i, o);
    },
    copy() {
        return this.map((x) => x);
    },
    forEachOwn(f) {
        let o = this;
        let keys = Object.keys(this);
        keys.forEach((k) => f(o[k], k, o));
    },
    reduce(f, v) {
        let o = this;
        for (let i in o) v = f(v, o[i], i, o);
        return v;
    },
    join(del, pref, posf) {
        // merge key value pairs into string
    },
    mergeMap(p,f) {
        var o = this;
        for (let k in p) {
            o[k] = f(o,k,p);
        }
        return o;
    },
    merge(x) {
        return this.mergeMap(x,(o,k,p) => p[k]);
    },
    mergeOwn(p) {
        var o = this;
        Object.keys(p)
            .forEach((k) => o[k] = p[k]);
        return o;
    },
    concat(a) {
        var ret = {};
        a.forEach((ae,k) => ret[k] = ae);
        this.forEach((xe,j) => ret[j] = xe);
        return ret;
    },
    product(x) {
        let o = this;
        return x.map((f, name) => f(o[name]));
    },
})
Error.pdescribe({
    then(f,g) {
        if(is.function(g)) {
            try {
                return g(this);
            } catch(err) {
                throw err;
            }
        }
        return this;
    },
})
