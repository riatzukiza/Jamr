var Type = require("./type.js");
var BufferType = Type
        .Constructor(function(source) {
            Type.call(this, source)
        })
        .methods({});
module.exports = BufferType;
