var program = require("commander");

program
    .version("0.0.1")
    .option("-s, --output-size [number]", "number of terms generated from language model", 5)
    .option("-i, --input [path]", "path of training data")
    .option("-o, --output-dest [path]", "location to send output, defaults to stdout")
    .option("-n, --context-size [number]","the 'n' in n-gram. How deep does the model go?",2)
    .parse(process.argv);

global.curry = require("./lib/functional/partialApplication.js").curry

var NGramModel = require("./lib/probability/n-gram-model");
var testModel = (new NGramModel(null, program.contextSize));

var fs = require("fs");

const {
    chainPromise
} = require("./lib/promise")

var {input,outputSize,outputDest,contextSize} = program;
outputSize = parseInt(outputSize);
contextSize = parseInt(contextSize);

console.log("running program with inputs",{input,outputSize,outputDest,contextSize})
chainPromise(null, [
        () => testModel.buildFromPath(input),
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
