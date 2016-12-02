
var pLift = exports.pLift = (function pLift$(f) {
    /* p-lift src/macros/promise.sibilant:10:0 */

    return (x, i, a) => {

        return Promise.resolve(x).then((x) => {

            return f(x, i, a);

        });

    };
});
var mapPromiseParalell = exports.mapPromiseParalell = (function mapPromiseParalell$(a, f) {

    return Promise.all(a.map(pLift(f)));
});
var reduceAll = exports.reduceAll = (function reduceAll$(a, f, init) {

    return a.reduce((promise, x, k) => {

        return promise.then((result) => {

            return f(result, x, k, a);

        });

    }, Promise.resolve((init || null)));
});
var mapPromiseSerial = exports.mapPromiseSerial = (function mapPromiseSerial$(a, f) {
    /* map-promise-serial src/macros/promise.sibilant:31:0 */

    return reduceAll(a, (resArr, x, k) => {

        return Promise.resolve(f(x, k, a)).then((x) => {

            resArr.push(x);
            return resArr;

        });

    }, []);
});
var chainPromise = exports.chainPromise = (function chainPromise$(value, funcs) {
    /* chain-promise src/macros/promise.sibilant:40:0 */

    return funcs.reduce((result, f, i) => {

        return result.then(f);

    }, Promise.resolve(value));
});
// ;
var nodePromiseWrapper = exports.nodePromiseWrapper = curry((function(func, args) {
    /* src/macros/defs.sibilant:49:54 */

    return (new Promise((success, fail) => {

        var resolve = success,
            reject = fail;
        return func.apply(this, args.concat([(function(err, value) {
            /* src/macros/promise.sibilant:85:37 */

            return (function() {
                if (err) {
                    return success(value);
                } else {
                    return fail(err);
                }
            }).call(this);
        })]));

    }));
}));
