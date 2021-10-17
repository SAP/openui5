import Log from "sap/base/Log";
import escapeRegExp from "sap/base/strings/escapeRegExp";
import ObjectPath from "sap/base/util/ObjectPath";
import Filter from "sap/ui/model/Filter";
function makeJSDTStyleRegExp(term) {
    var l = term.length, s1 = "", s2 = "", i, c;
    for (i = 0; i < l; i++) {
        c = term[i];
        if (c >= "A" && c <= "Z" && i > 0) {
            s1 += "[a-z]*";
        }
        s1 += escapeRegExp(c);
        if (c.toUpperCase() !== c.toLowerCase()) {
            s2 += "[" + escapeRegExp(c.toUpperCase() + c.toLowerCase()) + "]";
        }
        else {
            s2 += escapeRegExp(c);
        }
    }
    Log.debug("converted '" + term + "' to /" + s1 + "|" + s2 + "/");
    return new RegExp(s1 + "|" + s2);
}
function makeFilterFunction(fields, terms) {
    function prepare(terms) {
        return terms.map(makeJSDTStyleRegExp);
    }
    var iFieldsLength = fields.length;
    fields = fields.map(function (field) {
        if (typeof field !== "object") {
            field = { path: field };
        }
        if (field.path != null) {
            if (field.formatter) {
                if (field.path.indexOf("/") >= 0) {
                    const aPath = field.path.split("/");
                    return function (o) {
                        return field.formatter(ObjectPath.get(aPath.slice(), o));
                    };
                }
                return function (o) {
                    return field.formatter(o[field.path]);
                };
            }
            else {
                if (field.path.indexOf("/") >= 0) {
                    const aPath = field.path.split("/");
                    return function (o) {
                        return ObjectPath.get(aPath.slice(), o);
                    };
                }
                return function (o) {
                    return o[field.path];
                };
            }
        }
        else if (Array.isArray(field.parts) && field.parts.length === 2) {
            return function (o) {
                return field.formatter(o[field.parts[0]], o[field.parts[1]]);
            };
        }
        else if (Array.isArray(field.parts)) {
            return function (o) {
                return field.formatter.apply(this, field.parts.map(function (path) { return o[path]; }));
            };
        }
        else {
            throw new Error("invalid search field configuration: {path:" + field.path + ", parts:" + field.parts + ", ...}");
        }
    });
    function match(regexps, o) {
        var i, s;
        s = "";
        if (o) {
            i = iFieldsLength;
            while (i--) {
                s += fields[i](o);
            }
        }
        i = regexps.length;
        while (i--) {
            if (!regexps[i].test(s)) {
                return false;
            }
        }
        return true;
    }
    if (terms) {
        return match.bind(this, prepare(terms.trim().split(/\s+/g)));
    }
    else {
        return function () { return true; };
    }
}