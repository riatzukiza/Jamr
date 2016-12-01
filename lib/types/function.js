var StringType = require("./string.js");
var FunctionType = StringType
    .Constructor(function(source, args) {

        //console.log("new function defined");
        StringType.call(this, source);
        this._function = null;
        this._args = args || [];
    })
    .evented({
        compile(args) {
            args = args||[];
            console.log("compiling",this._source.path);
            return this.getContent()
                .then(s => {
                    //console.log("got function content",s);
                    return this._function = new Function([...this._args, ...args], s);
                });
        },
        ecompile(args) {
            args = args||[];
            console.log("compiling",this._source.path);
            return this.getContent()
                .then(s => {
                    var a = [...this._args, ...args].join(",")
                    //console.log("got function content",s);
                    return this._function = eval(`(function(${a}) {${s}})`);
                });
        },
        call(target) {
            var args = [...arguments].slice(1);
            if (this._function) {
                return this._function.call(target, ...args);
            } else {
                throw new Error("Cannot call an uncompiled function");
            }
        },
        apply(target, args) {
            if (this._function) {
                //console.log("applying",this._function,"to",target,"with the following arguments",...args)
                return this._function.apply(target, args);
            } else {
                throw new Error("Cannot call an uncompiled function");
            }
        },
        eval() {
            return this.getContent().then(s => eval(s));
        },
        //calls the function, compileing the function if it is not already.
        forceCall() {
            if (this._function) {
                return this.call(...arguments);
            } else {
                return this.compile().then(() => {
                    console.log("calling function");
                    this.call(...arguments)
                });
            }
        },
        forceApply() {
            if (this._function) {
                return this.apply(...arguments);
            } else {
                return this.compile().then(() => this.apply(...arguments));
            }
        }
    });
module.exports = FunctionType;
