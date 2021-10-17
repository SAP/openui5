import Log from "sap/base/Log";
var fnEqual = function (a, b, maxDepth, contains, depth) {
    if (typeof maxDepth == "boolean") {
        contains = maxDepth;
        maxDepth = undefined;
    }
    if (!depth) {
        depth = 0;
    }
    if (!maxDepth) {
        maxDepth = 10;
    }
    if (depth > maxDepth) {
        Log.warning("deepEqual comparison exceeded maximum recursion depth of " + maxDepth + ". Treating values as unequal");
        return false;
    }
    if (a === b || Number.isNaN(a) && Number.isNaN(b)) {
        return true;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        if (!contains && a.length !== b.length) {
            return false;
        }
        if (a.length > b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (!fnEqual(a[i], b[i], maxDepth, contains, depth + 1)) {
                return false;
            }
        }
        return true;
    }
    if (typeof a == "object" && typeof b == "object") {
        if (!a || !b) {
            return false;
        }
        if (a.constructor !== b.constructor) {
            return false;
        }
        if (!contains && Object.keys(a).length !== Object.keys(b).length) {
            return false;
        }
        if (a instanceof Node) {
            return a.isEqualNode(b);
        }
        if (a instanceof Date) {
            return a.valueOf() === b.valueOf();
        }
        for (var i in a) {
            if (!fnEqual(a[i], b[i], maxDepth, contains, depth + 1)) {
                return false;
            }
        }
        return true;
    }
    return false;
};