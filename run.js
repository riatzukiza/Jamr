var program = require("commander");

function list (string) {
    return string.split(",")
}
program
    .version("0.0.1")
    .option("-s, --output-size [number]", "number of terms generated from language model", 5)
    .option("-i, --input <path>", "path of training data",list)
    .option("-o, --output-dest [path]", "location to send output, defaults to stdout")
    .option("-n, --context-size [number]", "the 'n' in n-gram. How deep does the model go?", 2)
    .parse(process.argv);

global.curry = require("./lib/functional/partialApplication.js").curry
require("./lib/natives/object.js")

var NGramModel = require("./lib/probability/n-gram-model");
var testModel = (new NGramModel(null, program.contextSize));

var fs = require("fs");

const {
    chainPromise
} = require("./lib/promise")

var {
    input,
    outputSize,
    outputDest,
    contextSize
} = program;

outputSize = parseInt(outputSize);
contextSize = parseInt(contextSize);

console.log("running program with inputs", {
    input,
    outputSize,
    outputDest,
    contextSize
});
var colors = require('colors');
chainPromise(null, [
        () => testModel.buildFromMany(input),
        () => testModel.randomWalk(outputSize),
        (output) => {
            if (outputDest)
                fs.writeFile(outputDest, output, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            else console.log(output);
        }
    ])
    .catch((function(err) {
        /* src/lib/n-gram-test.sibilant:19:14 */

        return console.log("ERROR", err);
    }));
