var Evented = require("../events/EventInterface.js");
var Type = Evented
        .Constructor(function(source) {
            Evented.call(this);
            this._source = source;
        })
        .methods({
            toString() {
                return this._source.getContent(s => s.toString());
            },
            getContent() {
                return this._source.getContent();
            },
            setContent(d) {
                return this._source.setContent(d);
            },
        });
module.exports = Type;
