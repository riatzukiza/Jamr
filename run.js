var program = require("commander");

program
    .version("0.0.1")
    .option("-s, --output-size [number]", "number of terms generated from language model")
    .option("-i, --input [path]", "path of training data")
    .option("-o, --output-dest [path]", "location to send output, defaults to stdout")
    .option("-n, --context-size [number]","the 'n' in n-gram. How deep does the model go?")
    .parse(process.argv);

global.curry = require("./lib/functional/partialApplication.js").curry

var NGramModel = require("./lib/probability/n-gram-model");
var testModel = (new NGramModel(null, program.contextSize));

var fs = require("fs");

const {
    chainPromise
} = require("./lib/promise")

chainPromise(null, [
        () => testModel.buildFromPath(program.input),
        () => testModel.randomWalk(program.outputSize),
        (output) => {
            if (program.outputDest)
                fs.writeFile(program.outputDest, output, (err) => {
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