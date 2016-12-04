var is = require("../functional/predicates"),
    TextDocument = require("../text-document"),
    File = require("../filesystem/File"),
    Trie = require("../datastructures/trie");
const {
    chainPromise,
    mapPromiseSerial
} = require("../promise.js");

var randomInt = (function randomInt$(min, max) {
    return Math.floor((Math.random() * (((max - min) + 1) + min)));
});

var NGramModel = Trie.Constructor((function NGramModel$(prefix, n) {
    /* N-gram-model src/macros/defs.sibilant:129:29 */

    Trie.call(this, prefix);
    this.count = 0;
    this.depth = n;
    // console.log("n-gram-depth", this.depth);
    // console.log("the var we got that from", n);
    return this;
})).methods({
    buildFromPath: (function(path) {
        /* src/lib/probability/n-gram-model.sibilant:30:33 */

        return this.build((new TextDocument(path)));
    }),

    buildFromMany(values) {
        return mapPromiseSerial(values, (value, i) => {
            if (typeof value === "string") {
                return this.buildFromPath(value);
            } else if (value instanceof TextDocument) {
                return value;
            }
        });
    },
    addFeature: (function(token) {
        /* src/lib/probability/n-gram-model.sibilant:34:29 */

        var featureNode = this.add(token, (new NGramModel(this, (this.depth - 1))));
        featureNode.count = (1 + featureNode.count);
        return featureNode;
    }),
    save: (function(path) {
        /* src/lib/probability/n-gram-model.sibilant:40:22 */

        return (new File(path)).setContent(JSON.stringify(this, null, "\t"));
    }),
    load(path) {
        let fs = require("fs");
        let file = fs.readFileSync(path);
        this.merge(Object.create(JSON.parse(file)))
        this.traverse((node) => (node.__proto__ = NGramModel.prototype, node));
    },
    build: (function(document) {
        /* src/lib/probability/n-gram-model.sibilant:42:23 */

        var n = this.depth;
        //console.log("building trie from", document);
        return chainPromise(null, [(future) => {

            let current = [];
            for (let i = 0; i < n; i++) {
                current.push("<START>")
            }

            return document.mapWordsS((word, i, a) => {
                current.push(word);
                current.shift();
                //console.log("current",current)
                return [...current];

            });

        }, (future) => {

            return mapPromiseSerial(future, this.insertFeature.bind(this));

        }]);
    }),
    buildCharacterFromPath(path) {
        return this.characterBuild((new TextDocument(path)));
    },
    characterBuild: (function(document) {
        /* src/lib/probability/n-gram-model.sibilant:42:23 */

        var n = this.depth;
        //console.log("building trie from", document);
        return chainPromise(null, [(future) => {

            return document.getContent()
                .then((chars) =>
                    chars.split("").map((char, i, a) => {

                        var feature = a.slice(i, (i + n));
                        return feature;
                    }));

        }, (future) => {

            return mapPromiseSerial(future, this.insertFeature.bind(this));

        }]);
    }),

    emitWeightedRandom: (function() {
        /* src/lib/probability/n-gram-model.sibilant:88:38 */

        var total = this.count - 1,
            tokenTotal = this.tokens.length - 1,
            rand = randomInt(0, total),
            suffixes = this.suffixes,
            tokens = this.tokens,
            sum = 0,
            i = 0;
        var randomToken = (word, index) => {

            /*

             console.log("rolling", {
             i: i,
             word: word,
             rand: rand,
             sum: sum,
             total: total,
             tokenTotal: tokenTotal
             });
             */
            sum += suffixes[index].count;
            i = index;
            return rand < sum;

        };
        var emission = tokens.find(randomToken);
        (function() {
            if (is.undefined(emission)) {
                return console.log("emitting undefined", {
                    i: i,
                    suposedToken: tokens[i],
                    tokens: tokens,
                    total: total
                });
            }
        }).call(this);
        //console.log("emitting", emission);
        return emission;
    }),
    emitBestGuess: (function() {
        /* src/lib/probability/n-gram-model.sibilant:122:33 */


    }),
    randomWalk: (function(length) {
        /* src/lib/probability/n-gram-model.sibilant:125:29 */

        var i = 0,
            emission = "",
            word = "",
            priors = [];
        return (function() {
                var while$1 = undefined;
                while (!(i === length)) {
                    while$1 = (function() {
                        i = (1 + i);
                        this._trimSeq(priors);
                        word = this.given(priors).emitWeightedRandom();
                        priors.push(word);
                        return emission = (emission + " " + word);
                    }).call(this);
                };
                return while$1;
            }).call(this)
            .replace(/<s>/g, "\n").replace(/<\/s>/g, ".");
    }),
    _tooShort: (function() {
        /* src/lib/probability/n-gram-model.sibilant:56:28 */

        console.log("too short");
        return false;
    }),
    _insertFeature: (function(seq) {
        /* src/lib/probability/n-gram-model.sibilant:59:33 */

        //console.log("inserting feature", seq);
        var prevNode = null;
        return this.seqReduce(seq, (function(node, feature) {
            /* src/lib/probability/n-gram-model.sibilant:63:40 */

            return prevNode = node.addFeature(feature);
        }));
    }),
    insertFeature: (function(seq) {
        /* src/lib/probability/n-gram-model.sibilant:65:32 */

        //console.log("inserting a feature of length", seq.length, "into a model of depth", this.depth);
        return (function() {
            if (seq.length < this.depth) {
                return this._tooShort();
            } else {
                return this._insertFeature(seq);
            }
        }).call(this);
    }),
    given: (function(seq) {
        /* src/lib/probability/n-gram-model.sibilant:75:23 */

        //console.log("follow seq", seq);
        return this.followTo(seq, (currNode) => {

            // console.log("given", currNode);
            //console.log("depth", currNode.depth);
            return currNode;

        });
    }),
    likelyhood: (function() {
        /* src/lib/probability/n-gram-model.sibilant:84:28 */

        return this.prefix.count(this.count);
    }),
    traceToRoot: (function() {
        /* src/lib/probability/n-gram-model.sibilant:87:31 */


    }),
    leastLikely: (function() {
        /* src/lib/probability/n-gram-model.sibilant:142:30 */


    }),
    removeLeastLikely: (function() {
        /* src/lib/probability/n-gram-model.sibilant:143:37 */


    }),
    _trimSeq: (function(seq) {
        /* src/lib/probability/n-gram-model.sibilant:145:27 */

        return (function() {
            if (!(seq.length <= (this.depth - 1))) {
                //console.log("sequence too big, shortening", seq);
                return seq.shift();
            }
        }).call(this);
    })
}).static({
    blankNGram: (function(filler, n) {
        /* src/lib/probability/n-gram-model.sibilant:153:29 */

        var nGram = [];
        (function() {
            var while$2 = undefined;
            while (!(nGram.length === n)) {
                while$2 = (function() {
                    return nGram.push(filler);
                }).call(this);
            };
            return while$2;
        }).call(this);
        return nGram;
    })
});
module.exports = NGramModel;
