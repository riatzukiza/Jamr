"use strict";
require("../natives/object.js");
var streams = require("stream");
var Readable = streams.Readable;
var Writeable = streams.Writable;
var logical = require("../functional/logical.js");
var File = require("./File.js");
var Path = require("path");
var cond = logical.conditional.binary;

var is = require("../functional/predicates.js");
var maybe = logical.maybe.binary;
var functors = require("../functional/functors.js");
var getProp = functors.getProp;
var compose = functors.compose;

var fs = require("fs");
var Promise = require("bluebird");
var obj = require("../wrappers/array.js");
var part = require("../functional/partialApplication.js");
var curry = part.curry;
Promise.promisifyAll(fs);
var Inode = require("./Inode.js");

var iden = (c) => c;



var Dir = Inode
    .Constructor(function() {
        Inode.call(this, ...arguments);
    })
    .methods({
        map(f) {
            return this.getContent()
                .then(a =>{
                    return Promise.all(a.map(path => Inode.get(Path.join(this.path, path))
                                             .then(f)))
                })
                .then((dir => this._dir = dir));
        },
    })
    .evented({
        getChildren_r() {
            return this.mapr((inode) => inode);
        },
        mapo() {
        },
        mapr(f) {
            var x = (inode, i) => f(inode).then((d) => {
                var container = {
                    data: d
                };
                if (is.instanceof(Dir, inode)) {
                    return inode.map(x).then((y) => {
                        container.children = y;
                        return container;
                    });
                }
                return container;
            });
            return this.map(x);
        },
        getChildren() {
            return this.getContent()
                .then(a =>{
                    return Promise.all(a.map(f => Inode.get(Path.join(this.path, f))))
                })
                .then((dir => this._dir = dir));
        },
        setChild(x, v, opt) {
            opt = opt||{};
            if (is.string(v) || is.buffer(v)) {
                return this.setFile(x, v);
            } else if (is.function(v)) {
                return this.setFile(x + ".js", v);
            } else if (opt.stringify) {
                return this.setFile(x + ".json", JSON.stringify(x));
            } else {
                return this.setChildren({
                    [x]: v
                });
            }
        },
        setChildren(o) {
            //console.log("setting children from object", o);
            return o.map((x, k) =>
                    is.maybe.object(x)
                    .then(x => {
                        if (Path.extname(k) === ".json") {
                            //console.log(k,"was a json file");
                            return this.setFile(x + ".json", JSON.stringify(x));
                        } else if (is.instanceof(Dir, x) || is.instanceof(File, x)) {
                            //console.log(k,"was a Directory or File");
                            return x.copy(Path.join(this.path, x));
                        } else {
                            //console.log(k,"was an object",o);
                            return Dir.create(Path.join(this.path, k), o[k]);
                        }
                    })
                    .otherwise(x => this.setChild(k, x)))
                .promiseAll();
        },
        addDir(name) {
            return fs.mkdirAsync(Path.join(this.path, name));
        },
        getChild(name) {
            //console.log("getting child", name);
            return Inode.get(Path.join(this.path, name), this._pool);
        },
        getChildContent(name) {
            return this.getChild(name).then(c => c.getContent());
        },
        getContent() {
            console.log("getting content of dir",this.path);
            return fs.readdirAsync(this.path);
        },
        setContent(data) {
            return fs.mkdirAsync(this.path, data);
        },
        doesNotExist(name, f) {
            return this.getChild(name)
                .catch(err => err)
                .then((f) => {
                    throw new TypeError("cannot access file " + name +
                        " inode with that name already exists");
                });
        },
        setFile(name, s) {
            var f = new File(Path.join(this.path, name), this._pool)
            return f.setContent(s || "")
                .then(() => f);
        },
        getParent() {
            return new Dir(Path.join("..", this.path));
        },
        getChildFile(name) {
            return new File(Path.join(this.path, name), this._pool);
        },
        getChildDir(name) {
            return new Dir(Path.join(this.path, name), this._pool);
        }
    })
    .methods({
        length() {
            return this.getContent()
                .then(a => a.length);
        },
        //for the sake of polymorphisim with the File class
        getReadStream() {

            var stream = new Readable();
            var i = 0;
            var a = null;

            stream._read = function() {
                if (a) {

                    if (++i > a.length)
                        stream.push(null);

                    else stream.push(a[i]);

                }
            };

            this.getContent()
                .then(d => a = d);

            return stream;
        },
        getJSONReadStream() {
        },
        getJSONWriteStream() {
        }
    })
    .static({
        _directories: new Map(),
        create(path, obj) {
            //console.log("creating directory at", path);
            return fs.mkdirAsync(path)
                .always(() => {
                    //console.log("always return DIR.get")
                    return Dir.get(path)
                })
                .then(dir => {
                    return is.maybe
                        .object(obj)
                        .then((o) => {
                            if(Object.keys(o).length !== 0) {
                                return dir.setChildren(o)
                            } else {
                                return dir;
                            }
                        })
                        .otherwise(() => {
                            //console.log("no object to create children with, returning dir")
                            return dir;
                        });
                })
        },
        get(path) {
            if (this._directories.has(path))
                return Promise.resolve(this._directories.get(path));

            var d = new Dir(path);

            this._directories.set(path, d);

            return d.stat()
                .then((stats) => {

                    if (stats.isDirectory()) {
                        return d;
                    } else {
                        this._directories.delete(path);
                        throw new TypeError("inode is not a directory");
                    }

                });
        },
        getList(path) {
            return Dir.get(path)
                .then(dir => dir.getChildren());
        }
    });
Inode.types.Dir = Dir;
is.dir = part.curry(cond)(is.instanceof(Dir));
module.exports = Dir;
