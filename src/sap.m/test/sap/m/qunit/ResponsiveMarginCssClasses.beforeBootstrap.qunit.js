(function() {
    "use strict";
    let resolve;
    const pQunit = new Promise((res, rej) => {
        resolve = res;
    });

    /**
     * qunit-composite expects that QUnit in the iframe is available when the load
     * event of the iframe occurs. After the introduction of the 1Chunk approach,
     * this is no longer fulfilled when QUnit is loaded async within the iframe
     * (e.g. by the test starter).
     *
     * As qunit-composite reacts on the presence of an AMD loader and alternatively
     * requires QUnit, we mimic an AMD loader here and resolve qunit-composite's
     * require call only after QUnit has been loaded.
     *
     * This approach only works as long as no other AMD loader comes into life during
     * the bootstrap.
     */
    globalThis.define = function() {};
    globalThis.define.amd = true;
    globalThis.require = function(dep, callback) {
        pQunit.then(callback);
    };
    globalThis.require.resolve = resolve;
})();