var Type = require("./type.js");
var is = require("../functional/predicates.js");
var Path = require("path");

var File = require("../filesystem/File.js");
var Evented = require("../events/EventInterface.js");
var FunctionType = require("./function.js");
var ArrayType = require("./array.js");
var ObjectType = Type
    .Constructor(function(source, prototype) {
        Type.call(this, source);
        this._proto = prototype;
    })
    .methods({
        getContent() {
            if (this._source.getChildren_r) {
                return this._source.getChildren_r();
            } else {
                return this._source.getContent()
                    .then(data => {
                        if (is.object(data)) {
                            return data;
                        } else if (is.string(data) ) {
                            if(Path.extname(this._source.path) === ".json") {
                                return JSON.parse(data);
                            } else if(Path.extname(this._source.path) === ".jsol") {
                                return eval("("+data+")");
                            } else {
                                throw new TypeError("source cannot be interpreted as object");
                            }
                        } else {
                            throw new TypeError("source cannot be interpreted as object");
                        }
                    });
            }
        },
        setContent(o) {
            if(this._source.setChildren) {
                return this._source.setChildren(o);
            } else if (is.string(o)){
                return this._source.setContent(JSON.stringify(o));
            } else {
                return this._source.setContent(o);
            }
        },
        forEach() {},
        map() {},
        mapr() {},
        product() {},
        productr() {},
        merge() {},
        copy() {},
        bind(f) {},
        //calls a child entity as a function and returns the results.
        callChild(p, args) {
            var functionName = p + ".js";
            var argsName = functionName + '.args';
            var functionSource;
            return this._source.getChild(functionName)
                .then(source => {
                    functionSource = source;
                    return this._source.getChild(argsName);
                })
                .then((argNameSource) => {
                    var a = new ArrayType(argNameSource);
                    return a.getContent();
                })
                .then((argNames) => {
                    var f = new FunctionType(functionSource, argNames);
                    return f.forceApply(this, args);
                })
        },
        getChild(p) {
            if(this._source.getChild) {
                return this._source.getChild(p)
                    .then(source => {
                        if (source.getChild) {
                            return new ObjectType(source);
                        } else {
                            return new Type(source);
                        }
                    });
            } else {
                throw new Error("retrieving children from a json source is not yet an implemented feature");
                return this._source.getContent()
                    .then(str => {
                        return;//not implemented
                    });
            }
        },
        setChild() {}
    });
module.exports = ObjectType;
