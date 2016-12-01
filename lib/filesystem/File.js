var Inode = require("./Inode.js");
var logical = require("../functional/logical.js");
var maybe = logical.maybe.binary;
var mayhaps = logical.maybe;
var fs = require("fs");
var Promise = require("bluebird");
var part = require("../functional/partialApplication.js").bind;
var Path = require("path");
Promise.promisifyAll(fs);

function maybeCache(d) {
    if (this.shouldCache) this._data = d
    return d;
};
var File = Inode
    .evented({
        readFile: function(encoding) {
            return fs.readFileAsync(this.path, encoding);
        },
        writeFile:function(data) {
            return fs.writeFileAsync(this.path, data);
        },
        getContent: function(encoding) {
            return this._maybeData((d) => d,
                () => this.readFile(encoding)
                .then((d) => {
                    if (this.shouldCache) this._data = d;
                    return d;
                }));
        },
        setContent: function(data) {
            return this.writeFile(data)
                .then(() => {
                    if (this.shouldCache) this._data = data;
                    return data;
                });
        },
        size: function() {
            this.stat()
                .then((s) => s.size);
        },
    })
    .Constructor(function FileConstructor(path, shouldCache) {
        //console.log("Creating file", path);
        Inode.call(this, path);
        this.shouldCache = shouldCache || true;
        this._data = null;

    })
    .static({
        isNotLocked: function(f) {
            return function() {
                return maybe(this.stream,
                    (stream) => {
                        throw Error("file locked " + this.path);
                    }, f.bind(this));
            };
        },
        cache: new Map(),
        get: function(path) {
            //console.log("getting file", path);
            if (this.cache.has(path)) {
                //console.log("file entity exists", path)
                return this.cache.get(path);
            } else {
                //console.log("getting file entity", path)
                var file = new File(path);
                this.cache.set(path, file);
                return file;
            }
        },
        copyFile: function(p1, p2) {
            var f1 = new File(p1);
            var read = f1.getReadStream();
            var f2 = new File(p2);
            var write = f2.getWriteStream();

            read.pipe(write);
            return {
                origin: f1,
                destination: f2
            };
        },
        saveStream(path,source) {
            var file = new File(path);
            source.file = file;
            return source.pipe(file.getWriteStream());
        }
    });
File = File.methods({
    getReadStream: function() {
        return this.stream = fs.createReadStream(this.path)
            .on("end", () => {
                delete this.stream;
            });
    },
    getWriteStream: function() {
        return this.stream = fs.createWriteStream(this.path)
            .on("end", () => {
                delete this.stream;
            });
    },
    getJSONReadStream() {
    },
    getJSONWriteStream() {
    },
    pipe(writable) {
        return this.getReadStream().pipe(writable)
    },
    copy: function(dest) {
        return new Promise((success, fail) => {
            console.log("copying file", this.path);
            var copyMap = this.copyStream(dest)
                .destination
                .stream
                .on("end", function() {
                    console.log("done copying");
                    success(copyMap);
                })
                .on("error", (e) => {
                    console.log("error in copying file",this.path);
                    console.log(e);
                    fail(e);
                });
        });
    },
    copyStream: function(path) {
        return File.copyFile(this.path, Path.join(this.path,"..",path))
    },
    _maybeData: function(f, g) {
        return maybe(f, g, this._data);
    },
});
Inode.types.File = File;
var file;
/*Inode.get("/home/aaron/devel/node_modules/lib/lib/filesystem/test.txt")
    .then((f) => {
        file = f;
        return file.watch()
            .on("change", (path, stats) =>
                file.getContent("utf8")
                .then(console.log
                    .bind(console, "is the content")))
            .getContent("utf8");
    })
    .then((data) => {
        console.log("this is the content", data);
        return file.setContent(data + " Oh, and bar is also foo.");
    })
    .then(() => file.copy("./otherTest.txt"))
    .then((otherFile) => otherFile.getContent())
    .then((s) => console.log("other file content", s))*/
module.exports = File;
