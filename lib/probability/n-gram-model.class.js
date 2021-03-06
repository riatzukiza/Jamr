
class NGramModel extends Trie {
    constructor(prefix, n) {
        super(prefix);
        this.count = 0;
        this.depth = n;
    }
    buildFromPath(path) {
        return this.build((new TextDocument(path)));
    }
    buildFromMany(...values) {
        return mapPromiseSerial(values, (value, i) => {
            if (typeof value === "string") {
                return this.buildFromPath(value);
            } else if (value instanceof TextDocument) {
                return value;
            }
        });
    }
    addFeature(token) {
        var featureNode = this.set(token, (new NGramModel(this, (this.depth - 1))));
        featureNode.count = (1 + featureNode.count);
        return featureNode;
    }
    save(path) {
        return (new File(path)).setContent(JSON.stringify(this, null, "\t"));
    }
    build(document) {
        var n = this.depth;
        return document.getWordList()
            .then(words => words
                .map((word, i, a) => a.slice(i, (i + n)))
                .map(this.insertFeature.bind(this)));

    }
    buildCharacterFromPath(path) {
        return this.characterBuild((new TextDocument(path)));
    }
    characterBuild(document) {

        var n = this.depth;

        return document.getContent()
            .then((chars) =>
                chars.split("").map((char, i, a) => {
                    var feature = a.slice(i, (i + n));
                    return feature;
                }))
            .then((features) => mapPromiseSerial(features, this.insertFeature.bind(this)));
    }
    _tooShort() {
        /* src/lib/probability/n-gram-model.sibilant:56:28 */

        return false;
    }
    _insertFeature(seq) {
        var prevNode = null;
        return this.seqReduce(seq, (node, feature) => prevNode = node.addFeature(feature));
    }
    insertFeature(seq) {
        if (seq.length < this.depth) {
            return this._tooShort();
        } else {
            return this._insertFeature(seq);
        }
    }
    given(seq) {
        return this.followTo(seq, (currNode) => {

            return currNode;

        });
    }
    likelyhood() {
        return this.prefix.count(this.count);
    }
    emitWeightedRandom() {
        /* src/lib/probability/n-gram-model.sibilant:88:38 */

        var total = this.count - 1,
            tokenTotal = this.suffixes.size - 1,
            rand = randomInt(0, total),
            suffixes = this.suffixes,
            sum = 0,
            i = 0;
        function find(m,f) {
            for(var [k,v] of m) {
                if(f(k,v))return k;
            }
            return false;
        }
        var randomToken = (word, index) => {

            console.log("rolling", {
                i: i,
                word: word,
                rand: rand,
                sum: sum,
                total: total,
                tokenTotal: tokenTotal
            });
            sum += suffixes.get(word).count;
            i = index;
            return rand <= sum;

        };
        var emission = find(suffixes,randomToken);
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
        return emission;
    }
    randomWalk(length) {
        var i = 0,
            emission = "",
            word = "",
            priors = [];
        while (!(i === length)) {

            console.log("RANDOMLY WALKING", i, "to", length)

            i = (1 + i);
            this._trimSeq(priors);
            word = this.given(priors).emitWeightedRandom();
            priors.push(word);
            emission += (" " + word);
        };
        return emission;
    }
    _trimSeq(seq) {
        return !(seq.length <= (this.depth - 1)) ? seq.shift() : false;
    }
}
