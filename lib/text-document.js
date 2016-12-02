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

class TextDocument extends StringType {
    constructor(path) {
        super(new File(path))
    }
    getWordList() {

        console.log("getting word list");
        return chainPromise(null, [(future) => {

            return this.getContent();

        }, (future) => {

            var s = future.replace((new RegExp("([^\.!\?]+[\.!\?]+)", "g")), " <s> $1 </s> ").match(wordExpr);
            console.log("word list", s);
            return s;

        }]);
    }
    mapWordsP(f) {
        /* src/lib/text-document.sibilant:29:17 */

        return chainPromise(null, [(future) => {

            return this.getWordList();

        }, (future) => {

            console.log("mapping word list", future);
            return mapPromiseParalell(future, f);

        }]);
    }
    map(f) {
        return this.getWordList()
            .then(words => words.map(f))
    }
    mapWordsS(f) {
        /* src/lib/text-document.sibilant:36:17 */

        return chainPromise(null, [(future) => {

            return this.getWordList();

        }, (future) => {

            return mapPromiseSerial(future, f);

        }]);
    }

}
module.exports = TextDocument;
