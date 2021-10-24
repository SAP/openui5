import LoaderExtensions from "sap/base/util/LoaderExtensions";
export class Properties {
    getProperty(sKey: any, sDefaultValue: any) {
        var sValue = this.mProperties[sKey];
        if (typeof (sValue) == "string") {
            return sValue;
        }
        else if (sDefaultValue) {
            return sDefaultValue;
        }
        return null;
    }
    getKeys(...args: any) {
        if (!this.aKeys) {
            this.aKeys = Object.keys(this.mProperties);
        }
        return this.aKeys;
    }
    setProperty(sKey: any, sValue: any) {
        if (typeof (sValue) != "string") {
            return;
        }
        if (typeof (this.mProperties[sKey]) != "string" && this.aKeys) {
            this.aKeys.push(String(sKey));
        }
        this.mProperties[sKey] = sValue;
    }
    clone(...args: any) {
        var oClone = new Properties();
        oClone.mProperties = Object.assign({}, this.mProperties);
        return oClone;
    }
    static create(mParams: any) {
        mParams = Object.assign({ url: undefined, headers: {} }, mParams);
        var bAsync = !!mParams.async, oProp = new Properties(), vResource;
        function _parse(sText) {
            if (typeof sText === "string") {
                parse(sText, oProp);
                return oProp;
            }
            return mParams.returnNullIfMissing ? null : oProp;
        }
        if (typeof mParams.url === "string") {
            vResource = LoaderExtensions.loadResource({
                url: mParams.url,
                dataType: "text",
                headers: mParams.headers,
                failOnError: false,
                async: bAsync
            });
        }
        if (bAsync) {
            if (!vResource) {
                return Promise.resolve(_parse(null));
            }
            return vResource.then(function (oVal) {
                return _parse(oVal);
            }, function (oVal) {
                throw (oVal instanceof Error ? oVal : new Error("Problem during loading of property file '" + mParams.url + "': " + oVal));
            });
        }
        return _parse(vResource);
    }
    constructor(...args: any) {
        this.mProperties = {};
        this.aKeys = null;
    }
}
var flatstr = (typeof chrome === "object" || typeof v8 === "object") ? function (s, iConcatOps) {
    if (iConcatOps > 2 && 40 * iConcatOps > s.length) {
        Number(s);
    }
    return s;
} : function (s) { return s; };
var rLines = /(?:\r\n|\r|\n|^)[ \t\f]*/;
var rEscapesOrSeparator = /(\\u[0-9a-fA-F]{0,4})|(\\.)|(\\$)|([ \t\f]*[ \t\f:=][ \t\f]*)/g;
var rEscapes = /(\\u[0-9a-fA-F]{0,4})|(\\.)|(\\$)/g;
var mEscapes = {
    "\\f": "\f",
    "\\n": "\n",
    "\\r": "\r",
    "\\t": "\t"
};
function parse(sText, oProp) {
    var aLines = sText.split(rLines), sLine, rMatcher, sKey, sValue, i, m, iLastIndex, iConcatOps;
    function append(s) {
        if (sValue) {
            sValue = sValue + s;
            iConcatOps++;
        }
        else {
            sValue = s;
            iConcatOps = 0;
        }
    }
    oProp.mProperties = {};
    for (i = 0; i < aLines.length; i++) {
        sLine = aLines[i];
        if (sLine === "" || sLine.charAt(0) === "#" || sLine.charAt(0) === "!") {
            continue;
        }
        rMatcher = rEscapesOrSeparator;
        rMatcher.lastIndex = iLastIndex = 0;
        sKey = null;
        sValue = "";
        while ((m = rMatcher.exec(sLine)) !== null) {
            if (iLastIndex < m.index) {
                append(sLine.slice(iLastIndex, m.index));
            }
            iLastIndex = rMatcher.lastIndex;
            if (m[1]) {
                if (m[1].length !== 6) {
                    throw new Error("Incomplete Unicode Escape '" + m[1] + "'");
                }
                append(String.fromCharCode(parseInt(m[1].slice(2), 16)));
            }
            else if (m[2]) {
                append(mEscapes[m[2]] || m[2].slice(1));
            }
            else if (m[3]) {
                sLine = aLines[++i];
                rMatcher.lastIndex = iLastIndex = 0;
            }
            else if (m[4]) {
                sKey = sValue;
                sValue = "";
                rMatcher = rEscapes;
                rMatcher.lastIndex = iLastIndex;
            }
        }
        if (iLastIndex < sLine.length) {
            append(sLine.slice(iLastIndex));
        }
        if (sKey == null) {
            sKey = sValue;
            sValue = "";
        }
        oProp.mProperties[sKey] = flatstr(sValue, sValue ? iConcatOps : 0);
    }
}