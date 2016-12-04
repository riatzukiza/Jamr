var program = require("commander");

function list(string) {
    return string.split(",")
}
program
    .version("0.0.1")
    .option("-s, --output-size [number]", "number of terms generated from language model", 5)
    .option("-i, --input <path>", "path of training data", list)
    .option("-o, --output-dest [path]", "location to send output, defaults to stdout")
    .option("-n, --context-size [number]", "the 'n' in n-gram. How deep does the model go?", 2)
    .option("-l, --load [path]", "load an existing model")
    .option("-w, --save [path]", "save the resulting model")
    .parse(process.argv);

global.curry = require("./functional/partialApplication.js").curry
require("./natives/object.js")

var NGramModel = require("./lib/probability/n-gram-model");
var testModel = (new NGramModel(null, program.contextSize));

var fs = require("fs");

const {
    chainPromise
} = require("./promise")

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
chainPromise(null, [
        () => {
            if(program.load) {
                testModel.load(program.load);
            }
            if(program.input)
                return testModel.buildFromMany(input);
        },
        () => testModel.randomWalk(outputSize),
        (output) => {
            //let parsed = output.replace(/<s>/g, "\n").replace(/<\/s>/g,".")
            if (outputDest)
                fs.writeFile(outputDest, parsed , (err) => {
                    if (err) {
                        throw err;
                    }
                    if(program.save) {
                        return testModel.save(program.save);
                    }
                });
            else console.log(parsed);
        }
    ])
    .catch((function(err) {
        /* src/lib/n-gram-test.sibilant:19:14 */

        return console.log("ERROR", err);
    }));
