"use strict";
var Path = require("path");
var cond = require("../functional/logical.js").conditional.binary;
var conditional = require("../functional/logical.js").conditional;
var functors = require("../functional/functors.js");
var hom = functors.hom;
var adhoc = hom.adhoc;
var curry = require("../functional/partialApplication.js").curry;
var is = require("../functional/predicates.js");
var EventInterface = require("../events/EventInterface.js");
var fs = require("fs");
var Promise = require("bluebird");
Promise.promisifyAll(fs);

function isFile(s) {
    return s.isFile();
};

function getFile(path) {
    var File = require("./File.js");
    return File.get(path);
};

function isDir(s) {
    return s.isDirectory();
};

function getDir(path) {
    var Dir = require("./Dir.js");
    return Dir.get(path);
};

function notFound() {
    throw new TypeError("disk entity type not recognized");
};
var checkType = function(x) {
    if (x.isFile()) {
        return getFile(this.path);
    } else if (x.isDirectory()) {
        return getDir(this.path);
    } else return notFound();
};
var Inode = EventInterface
    .Constructor(function Inode(path) {
        EventInterface.call(this);
        this.path = path;
        this.name = Path.basename(path);
        this.ext = Path.extname(path);
        this.dirname = Path.dirname(path);
    })
    .evented({
        move(dest) {
            //console.log("moving",this.path,"to",dest,"from an instance");
            return fs.renameAsync(this.path, dest)
                .then(() => this.path = dest)
        },
        pipe: function(dest) {
            var self = this.getReadStream();
            self.pipe(dest);
            this.emit("pipe", self, dest);
            return this;
        },
        stat: function() {
            return fs.statAsync(this.path)
                .then((stats) => {
                    this._stats = stats;
                    stats.stat_time = this._statTime = Date.now();
                    return stats;
                });
        },
        getParent: function() {
            console.log("getting parent of", this)
            if (this._parent)
                return this._parent;
            this._parent = require("./Dir.js").get(Path.dirname(this.path));
            return this._parent;
        },
    })
    .methods({
        unwatch: function() {
            this._watcher.close();
            return this;
        },
        watch: function(config) {
            console.log("watching", this.path)
            var inode = this;
            //console.log("watching", this.path);
            this._watcher = chokidar
                .watch(this.path, config || {})
                .on("all", function(event) {
                    inode.emit(...arguments);
                });
            return this;
        },
    })
    .static({
        moveInode(src, dest) {
            //there seems to be a problem with inheritance that gets
            //static methods mixed in with instance methods
            //console.trace("moving", src, "to", dest);
            return Inode.get(src).then(fi => {
                //console.log("this is the file....", fi)
                return fi.move(dest)
            });
        },
        types: {},
        get: function(p) {
            var inode = new Inode(p);
            var stats = inode.stat();
            //console.log("getting", p)
            return stats
                .then((stats) => checkType.call(inode, stats));
        },
        watchFiles: function(ps, opts, handlers) {
            return Promise.all(ps.map(Inode.get))
                .then((inodes) => inodes
                    .watch(opts)
                    .handlers(handlers));
        },
        watchChange: function(ps, opts, handler) {
            return this.watch(ps, opts, {
                "change": handler
            });
        },
        setData: function(path, d) {
            return Inode.get(path)
                .then((file) => file.setContent(d));
        },
        getData: function(path, encoding) {
            return Inode.get(path)
                .then((file) => file.getContent(encoding));
        },
        watchOneChange: function(path, opts, handler) {
            return this.watch([path], opts, handler);
        },
    })
    /*
    function contract(before,after,func) {
        return hom(curry(conditional.binary)(,() => func));
    }
    */
module.exports = Inode;
