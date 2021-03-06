"use strict";
var is = require("./functional/predicates.js");
var obj = require("./wrappers/object.js");
var logical = require("./functional/logical.js");
var functors = require("./functional/functors.js");
var maybe = logical.maybe.binary;
var maybeu = logical.maybe.unary;

var DoublyLinkedList =
    require("./datastructures/DoublyLinkedList.js")
    .DoublyLinkedList;
/**
 * a linked list of functions meant to be itteratively executed to produce a result given a set of inputs.
 * */
class InterfaceMethod extends DoublyLinkedList {
    constructor(name, f) {
            super();
            if (!is.string(name))
                throw new Error("name of an interface method cannot be undefined");
            this.name = name;
            maybeu(() => this.push_head(f), f);
        }
        /**
         * for every element of a linked list, given a target
         * and an array of arguments, apply the element function to the
         * target with the array as parameters
         **/
    apply(target, args) {
        var v = null;
        this.forEach_head((f) => {
            v = f.apply(target, [...args, v, this.name]);
        });
        return v;

    }
    mApply(target, args, f) {
        return f.call(target, this.apply(target, args), args);
    }
    mBind(target, args) {
            var self = this;
            var m = function(f) {
                self.mApply(target, args, f);
            };
            m.method = this;
            return m;
        }
        /**
         * for every element of a linked list, given a target, and
         * a varadic list of arguments, call the element function
         * with the given target and the list of arguments as its parameters
         * */
    call(target) {
            var v = null;
            this.forEach_head((f) => v = f.call(target, ...[...arguments].slice(1), v, this.name));
            return v;
        }
        /**
         * return a new function bound to this method with a static target and initial arguments
         * */
    bind(target, args) {
            var self = this;
            var m = function() {
                return self.apply(target, [...args || [], ...arguments]);
            };
            m.method = this;
            return m;
        }
        /**
         * return a new interface method using this method as its head.
         * */
    defer(args) {
            var self = this;
            return new InterfaceMethod(function() {
                return self.apply(this, [...args, ...arguments]);
            });
        }
        /**
         * return a new function useing the given target as a fixed this, with the given arguments being appended to the
         * arguements given to the returned function.
         * */
    appendBind(target, args) {
            var b = this.bind(target)
            return function() {
                return b(...arguments, ...args);
            };
        }
        /**
         * returns a new method.
         * */
    static create(name, f) {
        return new InterfaceMethod(name, f);
    }
}
////////////////////////////////////////////////////////////////////
var interfacePrototype = obj.mask({
        /**
         * given an object of methods and a constructor function, return a new instance with the given methods and
         * constructor useing the current instance for default values for the new interface
         * */
        extend(methods, f) {
            return createInterface(
                methods,
                f,
                this.constructor,
                this);
        },
        mod(s, f) {
            return this
                .extend({})
        },
        /**
         * extend the current instance with only a set of methods and no constructor (the constructor used will be the empty
         * constructor.
         * */
        methods(m) {
            return this.extend(m, this.constructor);
        },
    })
    .map((m, k) => new InterfaceMethod(k, m));
var staticMethods = {
    /**
     * create a sub class based on this one
     * */
    extend: function(m, f, values, static_methods) {
        return createInterface(m, f, this, values, static_methods);
    },
    method: function(s, f) {
        return this.methods({
            [s]: f
        });
    },
    methods: function(m) {
        var cons = this;
        return this.extend(m, this, this);
    },
    static: function(obj) {
        return this.extend({}, this, this, obj);
    },
    aspects: function(obj) {
        return this.static(obj);
    },
    values: function(values) {
        return this.extend({}, this, values);
    },
    value: function(name, value) {
        return this.values({
            [name]: value
        });
    },
    methodsAfter: function(object, after) {
        return this
            .methods(object)
            .afterAllOwn(after);
    },
    methodsBefore: function(object, after) {
        return this
            .methods(object)
            .beforeAllOwn(after);
    },
    methodsMod: function(object, mod) {
        return this
            .methods(object)
            .modAll(mod);
    },
    /**
     * @param {string} name Name of the method to assign a test.
     * @param {function} func Function to be executed when testing the named method.
     */
    test: function(name, func) {},
    /**
     * Extend the interface with only a new constructor.
     */
    Constructor(f) {
        return this.extend(this._methods.o, f);
    },
    /**
     * A function to be called upon each execution of this the Interface.Constructor method.
     * This would be used to add class level meta features. The example which motivated
     * the addition of this method was that of a constructor with a dynamic type return.
     * In this case, the constructor was an Inode, where the exact type of the Inode is not known
     * Until after it is gotten. The Inode type is never used directly, it is a base type which
     * all file system objects inherit from. Somthing else that might be useful here, also inspired
     * by the inode type is another case related to that of an Inode, where an Inode might not exist on
     * *this* file system, but on some remote system, which would require a network call instead of a
     * filesystem call. If all of the basic methods for accessing a file are provided (readFile,
     * writeFile, etc), then all other methods would function the same. So the readFile method
     * would need to change from a call to fs.readFile to a call to a network socket with the same
     * return value (a promise, since we are promisifying everything), then all methods that depend
     * on this.readFile could still function the same.

     * Obviously this type of functionality could also be achieved by just creating a seperate class
     * where these methods are changed, but that is actually the goal here, except to create a way
     * to do this gracfully. A similar idea to my *non-deterministic inhertance* pattern, where a call
     * to a method does not yeild a known Class, but instead yeilds a known *abstract class* as it is
     * known of in other programming languages.

     * The benefits to doing this is that it will simplify the code and reduce redundency. There are
     * many instances in programming in an asyncronous envrionment where me as the programmer does
     * not actually know what type of data I might be getting or where it might be comeing from.

     * There are also many cases where one class is the basis for many classes, and that one class's
     * static methods needs a list of child classes that implement its type.

     * Perhaps it is possible that I keep track of child classes, as well as parent classes.

     * basicly the idea of adding this to the class is to extend the bas functionality of the
     * *createInterface* function which creates all interfaces, to further allow extension
     * of the idea of an interface, and properly implement an inheritance pattern for builders.

     */
    Builder(f) {
        var Constructor = this.Constructor.bind(this);
        this.Constructor = function() {
            return f.call(this, ...arguments, Constructor);
        };
    },
    /**
     * @param {object} methods an object of functions to be added to the interface as tests.
     */
    tests: function(obj) {},
    /**
     * @param {function} methods an object of functions to be added
     *                    to the constructor as static methods.
     */
    /**
     * given a method name and a function, add an action to the end of that methods execution chain.
     * */
    before: function(s, f) {
        this._methods.o[s].push_head(f);
        return this;
    },
    /**
     * given a method name and a function, add the function tot he beginning of that methods execution chain.
     * */
    after: function(s, f) {
        this._methods.o[s].push_tail(f);
        return this;
    },
    oafter: function(s, f) {
        this._methods.o[s].push_tail(function() {
            var args = [...arguments];
            var value = args.pop();
            var name = args.pop();
            return f.call(this, args, {
                name: name,
                value: value
            });
        });
        return this;
    },
    /**
     * assign a postcondition to all methods of a class
     * */
    afterAll: function(f) {
        this._methods.forEach((m, k) => this.after(k, f));
        return this;
    },
    oafterAll: function(f) {
        this._methods.forEach((m, k) => this.oafter(k, f));
        return this;
    },
    obefore: function(s, f) {
        this._methods.o[s].push_head(function() {
            var args = [...arguments];
            var value = args.pop();
            var name = args.pop();
            return f.call(this, args, {
                name: name,
                value: value
            });
        });
        return this;
    },
    beforeAll: function(f) {
        this._methods.forEach((m, k) => this.before(k, f));
        return this;
    },
    obeforeAll: function(f) {
        this._methods.forEach((m, k) => this.obefore(k, f));
        return this;
    },
    lift: function(s, f) {},
    /**
     * given a method name and a function, execute that function and use the return value as head of a new
     * method chain.
     * */
    mod: function(s, f) {
        this._methods.o[s] = new InterfaceMethod(s, f(this._methods.o[s], s, this._methods));
        return this;
    },
    /**
     * assign a precondition to all methods of the class.
     * */
    /**
     * call a given function for all methods of a class and use the result as the head of a new method chain.
     * */
    modAll: function(f) {
        this._methods.forEach((m, k) => this.mod(k, f));
        return this;
    },
    /*
     * given a regular expression and a function, for every method key that matches the regular expression, execute the
     * function with the method and its key as arguments.
     * */
    match: function(r, f) {
        this._methods.forEach((m, k) => {
            if (r.test(k)) {
                f(m, k);
            }
        });
        return this;
    },
    fluent: function(o) {
        return this.methodsAfter(o, function(name) {
            return this;
        })
    },
    /**
     * given a regular expression and a function, for every method key that does not match the expression, execute the
     * given function  with the matched method and its key as arguements.
     * */
    notMatch: function(r, f) {
        this._methods.forEach((m, k) => {
            if (!r.test(k)) {
                f(m, k);
            }
        });
        return this;
    },
    /**
     * given a regex and a function, for every method that matches the regular expression, place the given function at
     * the head of that methods execution chain.
     * */
    beforeMatches: function(regex, f) {
        this.match((m, k) => this.before(k, f));
        return this;
    },
    /**
     * given a regular expression and a function, for every method that matches the regular expression, place the
     * given function at the tail of that methods execution chain.
     * */
    afterMatches: function(regex, f) {
        this.match(regex, (m, k) => this.after(k, f));
        return this;
    },
    /**
     * given a regex and a function, for every method that does not match the regular expression, place the given function at
     * the head of that methods execution chain.
     * */
    beforeNonMatches: function(regex, f) {
        this.notMatch(regex, (m, k) => this.before(k, f));
        return this;
    },
    /**
     * given a regular expression and a function, for every method that does not match the regular expression, place the
     * given function at the tail of that methods execution chain.
     * */
    afterNonMatches: function(regex, f) {
        this.notMatch(regex, (m, k) => this.after(k, f));
        return this;
    },
    /**
     * create a new method at the given key useing the given function as its head.
     * */
    addmethod: function(name, f) {
        this._methods.set(name, new InterfaceMethod(name, f));
        return this;
    },
    /**
     * tail of those methods execution chain.
     * */
    afterAllOwn: function(f) {
        this._methods.forEachOwn((m, k) => {
            this.after(k, f)
        });
        return this;
    },
    oafterAllOwn: function(f) {
        this._methods.forEachOwn((m, k) => {
            this.oafter(k, f)
        });
        return this;
    },
    /**
     * for every own method of a class (methods that have not been inherited by a parent), add the given function to the
     * head of those methods execution chain.
     * */
    beforeAllOwn: function(f) {
        this._methods.forEachOwn((m, k) => this.before(k, f));
        return this;
    },
    /**
     * for every own method of a class (methods that have not been inherited by a parent), execute the given function
     * and use the result as the head of a new InterfaceMethod.
     * */
    modAllOwn: function(f) {
        this._methods.forEachOwn((m, k) => this.mod(k, f));
        return this;
    },
    mixin(type) {
        return createInterface(
            type._methods,
            new Function("t1", "t2",
                `return function ${this.name+type.name}Mixin () {
                t1.call(this,...arguments);
                t2.call(this,...arguments);
            }`)(type, this),
            this,
            type._values,
            type._static);
    },
    contracts: function(o) {
        var name = this.name;
        return this.Constructor(function() {
            this.super.call(this, ...arguments);
            obj(o)
                .product(this)
                .forEach((x, k) => {
                    if (x) return;
                    else throw new TypeError(`Wrong Type at index ${k} of ${name} expected ${o[k].name}`);
                });
        });
    }
};
////////////////////////////////////////////////////////////////////
function createInterface(methods, func, parent, values, static_methods) {

    var con = is.function(func) ?
        new Function("func",
            `return function ${func.name||"Interface"} () {
                    func.call(this,...arguments)
            }`)(func) : function() {};

    con.children = {};



    var parentProto = (typeof parent === "function" ?
        parent.prototype : {});
    con.prototype = Object.create(parentProto);

    con.prototype.constructor = con;

    methods = obj.mask(methods || interfacePrototype)
        .map((m, k) => new InterfaceMethod(k, m));

    con._values = obj.mask(values || {});

    if (is.function(parent)) {

        con.prototype.super = parent;
        con._methods = parent._methods
            .map(m => {
                return m.copy(m.name)
            })
            .extend(methods.o);

        con.family = Object
            .create(parent.family);

        con._values = parent._values
            .extend(con._values.o);

        con._static = parent._static
            .extend(static_methods || staticMethods);

    } else {
        con.family = {};
        con._static = obj
            .mask(staticMethods)
            .extend(static_methods || {});
        con._methods = obj
            .mask(interfacePrototype.o)
            .extend(methods);
    }
    ////////////////////////////////////////////////////////////////////
    //map methods to prototype.
    obj.mask(con._static)
        .forEach((sm, k) => con[k] = sm);
    obj.mask(con._methods)
        .forEach((m, k) => {
            con.prototype[k] = function() {
                return con._methods.o[k].apply(this, [...arguments]);
            };
        });
    //map default values to prtotype
    con._values.forEachOwn((v, k) => {
        con.prototype[k] = v
    });
    //add this constructor to the family of associated constructor.
    con.family[con.name] = con;
    if (parent) {
        parent.children[con.name] = con;
    }
    Types[con.name] = con;
    return con;
};
var Types = {};
////////////////////////////////////////////////////////////////////
//the base interface, used to create other interfaces
var Interface = createInterface(interfacePrototype, function() {});
Interface.Types = Types;
module.exports = {
    createInterface: createInterface,
    InterfaceMethod: InterfaceMethod,
    Interface: Interface,
};
