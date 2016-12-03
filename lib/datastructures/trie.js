var is = require("../functional/predicates"),
    Evented = require("../events/EventInterface"),
    maybe = require("../functional/logical").maybe;

var defPrivate = (function defPrivate$(o, key, value) {
    /* def-private src/lib/datastructures/trie.sibilant:7:0 */

    return Object.defineProperty(o, key, {
        value: value
    });
});
var Trie = Evented.static({
    privateMethod: (function(s, f) {
        /* src/lib/datastructures/trie.sibilant:27:40 */

        return this.method(("_" + s), f);
    })
}).Constructor((function Trie$(prefix) {
    /* Trie src/macros/defs.sibilant:129:29 */

    this.tokens = [];
    this.suffixes = [];
    this.indexes = Object.create(null);
    this._hasData = false;
    defPrivate(this, "prefix", (prefix || null));
    return this;
})).static({
    liftPrefixed: (function(k, f) {
        /* src/lib/datastructures/trie.sibilant:38:30 */

        return this.method((k + "Prefix"), (function(seq) {
            /* src/lib/datastructures/trie.sibilant:40:46 */

            return this.bindPrefix(seq, f);
        }));
    }),
    prefixed: (function(obj) {
        /* src/lib/datastructures/trie.sibilant:43:25 */

        var lift = (v, k) => {

            return this.liftPrefixed(v, k);

        };
        obj.forEach(lift);
        return this;
    }),
    prefixedMethods: (function(obj) {
        /* src/lib/datastructures/trie.sibilant:50:33 */

        return this.methods(obj).prefixed(obj);
    })
});
Trie = Trie.privateMethod("bindPrefix", (function(seq, f, args) {
    /* src/macros/defs.sibilant:186:47 */

    var args = Array.prototype.slice.call(arguments, 2);

    var leafKey = seqPop();
    var prefix = Object.create(f.apply(this, [seq].concat(args, [leafKey])));
    prefix.leafKey = leafKey;
    return prefix;
}));
Trie = Trie.privateMethod("isInSet", (function(k) {
    /* src/macros/defs.sibilant:186:47 */

    //console.log("is in set", k);
    return this.suffixes[this.indexes[k]];
}));
Trie = Trie.privateMethod("isNotInSet", (function(k) {
    /* src/macros/defs.sibilant:186:47 */

    //console.log("not in set", k);
    this.tokens.push(k);
    this.suffixes.push((new this.constructor(this)));
    this.indexes[k] = (this.suffixes.length - 1);
    return this.suffixes.slice(-1)[0];
}));
Trie = Trie.method("add", (function(key) {
    /* src/macros/defs.sibilant:186:47 */

    return maybe.binary(this._isInSet.bind(this, key), this._isNotInSet.bind(this, key), this.indexes[key]);
}));
Trie = Trie.method("set", (function(key, value) {
    /* src/macros/defs.sibilant:186:47 */

    var node = this.add(key);
    node._mark();
    return node.merge(value);
}));
Trie = Trie.method("get", (function(key) {
    /* src/macros/defs.sibilant:186:47 */

    ////console.log("getting", key);
    //console.log("from", this.indexes);
    var s = this.suffixes[this.indexes[key]];
    return (function() {
        if (is.undefined(s)) {
            throw (new Error((key + " is not defined on trie")))
        } else {
            return s;
        }
    }).call(this);
}));
Trie = Trie.method("hasKey", (function(key) {
    /* src/macros/defs.sibilant:186:47 */

    return !(is.undefined(this.indexes[key]));
}));
Trie = Trie.method("has", (function(seq) {
    /* src/macros/defs.sibilant:186:47 */

    var node = this;
    var exists__QUERY = (key) => {

        return (function() {
            if (node.has(key)) {
                node = node.get(key);
                return true;
            } else {
                return false;
            }
        }).call(this);

    };
    return seq.every(exists__QUERY);
}));
Trie = Trie.method("maybeHas", (function(seq, f, g) {
    /* src/macros/defs.sibilant:186:47 */

    var node = this;
    var exists__QUERY = (key) => {

        return (function() {
            if (node.has(key)) {
                node = node.get(key);
                return true;
            } else {
                return false;
            }
        }).call(this);

    };
    return (function() {
        if (seq.every(exists__QUERY)) {
            return f(node);
        } else {
            return g();
        }
    }).call(this);
}));
Trie = Trie.method("traverse", (function(f) {
    /* src/macros/defs.sibilant:186:47 */

    var recur = (branch, i) => {

        var token = branch.prefix.tokens[i];
        f(branch);
        return branch.traverse(f);

    };
    return this.suffixes.forEach(recur);
}));
Trie = Trie.method("forEach", (function(f) {
    /* src/macros/defs.sibilant:186:47 */

    var nonEmptyNodes = (x, k) => {

        return (function() {
            if (x._hasData) {
                return f(x);
            }
        }).call(this);

    };
    return this.traverse(nonEmptyNodes);
}));
Trie = Trie.method("map", (function(f) {
    /* src/macros/defs.sibilant:186:47 */

    var mapping = (new this.constructor());
    var to = (prev, value, k) => {

        var x = f(value, k);
        prev.set(k, x);
        return (prev.terminal__QUERY()) ? mapping : prev;

    };
    return this.reduce(to, r);
}));
Trie = Trie.method("reduce", (function(f, init) {
    /* src/macros/defs.sibilant:186:47 */

    var prev = init;
    var forReduction = (x, k) => {

        return f(prev, x, k) = undefined;

    };
    return this.traverse(forReduction);
}));
Trie = Trie.method("get", (function(key) {
    /* src/macros/defs.sibilant:186:47 */

    //console.log("getting", key);
    //console.log("from", this.indexes);
    var s = this.suffixes[this.indexes[key]];
    return (function() {
        if (is.undefined(s)) {
            throw (new Error((key + " is not defined on trie")))
        } else {
            return s;
        }
    }).call(this);
}));
Trie = Trie.method("remove", (function(key) {
    /* src/macros/defs.sibilant:186:47 */

    var index = this.indexes[key];
    delete this.indexes[key];
    delete this.suffixes[index];
    return delete this.tokens[index];
}));
Trie = Trie.method("seqReduce", (function(seq, f) {
    /* src/macros/defs.sibilant:186:47 */

    return seq.reduce(f, this);
}));
Trie = Trie.method("followTo", (function(seq, f) {
    /* src/macros/defs.sibilant:186:47 */

    var getNode = (curr, v, k) => {

        return f(curr.get(v));

    };
    return this.seqReduce(seq, getNode);
}));
Trie = Trie.method("insert", (function(seq, data) {
    /* src/macros/defs.sibilant:186:47 */

    var addNode = (currNode, v, k) => {

        return currNode.add(v);

    };
    var buildBranch = () => {

        return this.seqReduce(seq, addNode);

    };
    var prefix = this.bindPrefix(seq, buildBranch);
    var mark = (function mark$(node) {
        /* mark src/lib/datastructures/trie.sibilant:238:8 */

        return node._hasData = true;
    });
    return addNode(prefix, data);
}));
Trie = Trie.method("find", (function(seq) {
    /* src/macros/defs.sibilant:186:47 */

    return this.followTo(seq, (currNode, v, k) => {

        return currNode;

    });
}));
Trie = Trie.method("removeBranch", (function(seq) {
    /* src/macros/defs.sibilant:186:47 */

    return this.findPrefix(seq).remove(seq.slice(-1)[0]);
}));
Trie = Trie.method("removeReduce", (function(seq, f) {
    /* src/macros/defs.sibilant:186:47 */

    var last = seq.pop();
    return last;
}));
Trie = Trie.privateMethod("mark", (function() {
    /* src/macros/defs.sibilant:186:47 */

    return this._hasData = true;
}));
module.exports = Trie
