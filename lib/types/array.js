var Type = require("./type.js");
var ArrayType = Type
    .Constructor(function(source) {
        Type.call(this, source);
    })
    .methods({
        getContent() {
            return this.getContent()
                .then(c => {
                    if (Array.isArray(c)) {
                        return c;
                    } else {
                        var a = JSON.parse(c);
                        if (Array.isArray(a)) {
                            return a;
                        } else {
                            var a = eval(a);
                            if (Array.isArray(a)) {
                                return a;
                            } else {
                                throw new TypeError("Source cannot be interpreted as an array");
                            }
                        }
                    }
                })
        },
        forEach() {},
        map() {},
        mapr() {},
        product() {},
        productr() {},
        merge() {},
        copy() {},

    })
module.exports = ArrayType;
