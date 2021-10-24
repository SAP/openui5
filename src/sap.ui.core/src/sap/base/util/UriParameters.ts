import Log from "sap/base/Log";
export class UriParameters {
    get(sName: any, bAll: any) {
        if (bAll) {
            Log.warning("[Deprecated] UriParameters.get(..., true) must not be used, use getAll() instead.");
            return this.getAll(sName);
        }
        return this._get(sName);
    }
    static fromURL(sUrl: any) {
        return new UriParameters(sUrl);
    }
    static fromQuery(sQuery: any) {
        if (typeof sQuery === "string") {
            if (sQuery[0] !== "?") {
                sQuery = "?" + sQuery;
            }
            sQuery = sQuery.replace(/#/g, "%23");
        }
        return new UriParameters(sQuery);
    }
    constructor(sURL: any) {
        var mParams = Object.create(null);
        if (sURL != null) {
            if (typeof sURL !== "string") {
                throw new TypeError("query parameter must be a string");
            }
            parse(mParams, getQueryString(sURL));
        }
        this.has = function (sName) {
            return sName in mParams;
        };
        this._get = function (sName, bAll) {
            return sName in mParams ? mParams[sName][0] : null;
        };
        this.getAll = function (sName) {
            return sName in mParams ? mParams[sName].slice() : [];
        };
        this.keys = function () {
            return Object.keys(mParams).values();
        };
        var bParamWarning = false;
        Object.defineProperty(this, "mParams", {
            get: function () {
                if (!bParamWarning) {
                    Log.warning("[Deprecated] UriParameters.mParams must not be accessed.");
                    bParamWarning = true;
                }
                return Object.assign({}, mParams);
            },
            configurable: false
        });
    }
}
function getQueryString(sURL) {
    var iHash = sURL.indexOf("#");
    if (iHash >= 0) {
        sURL = sURL.slice(0, iHash);
    }
    var iSearch = sURL.indexOf("?");
    if (iSearch >= 0) {
        return sURL.slice(iSearch + 1);
    }
    return "";
}
function decode(str) {
    return decodeURIComponent(str.replace(/\+/g, " "));
}
function parse(mParams, sQueryString) {
    function append(sName, sValue) {
        if (sName in mParams) {
            mParams[sName].push(sValue);
        }
        else {
            mParams[sName] = [sValue];
        }
    }
    sQueryString.split("&").forEach(function (sName) {
        var iPos = sName.indexOf("=");
        if (iPos >= 0) {
            append(decode(sName.slice(0, iPos)), decode(sName.slice(iPos + 1)));
        }
        else if (sName.length) {
            append(decode(sName), "");
        }
    });
}