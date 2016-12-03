var Evented = require("./events/EventInterface");
var File = require("./filesystem/File.js");
var is = require("./functional/predicates");
var StringType = require("./types/string.js");
var wordExpr = (new RegExp("(<\\w+>)|(?:\\w+)|(</\\w+>)", "g"));

const {
    chainPromise,
    mapPromiseParalell,
    mapPromiseSerial
} = require("./promise")

var TextDocument = StringType.Constructor((function TextDocument$(path) {
    /* Text-document src/macros/defs.sibilant:106:29 */

    StringType.call(this, (new File(path)));
    return this;
})).methods({
    getWordList: (function() {
        /* src/lib/text-document.sibilant:18:17 */

        console.log("getting word list");
        return chainPromise(null, [(future) => {

            return this.getContent();

        }, (future) => {

            var s = future.replace((new RegExp("([^\.!\?]+[\.!\?]+)", "g")), " <s> $1 </s> ").match(wordExpr);
            console.log("word list", s);
            return s;

        }]);
    }),
    mapWordsP: (function(f) {
        /* src/lib/text-document.sibilant:29:17 */

        return chainPromise(null, [(future) => {

            return this.getWordList();

        }, (future) => {

            console.log("mapping word list", future);
            return mapPromiseParalell(future, f);

        }]);
    }),
    mapWordsS: (function(f) {
        /* src/lib/text-document.sibilant:36:17 */

        return chainPromise(null, [(future) => {

            return this.getWordList();

        }, (future) => {

            return mapPromiseSerial(future, f);

        }]);
    })
});
module.exports = TextDocument;
