import assert from "sap/base/assert";
function _includeStyleSheet(sUrl, mAttributes, fnLoadCallback, fnErrorCallback) {
    var createLink = function () {
        var oLink = document.createElement("link");
        oLink.rel = "stylesheet";
        oLink.href = sUrl;
        if (mAttributes && typeof mAttributes === "object") {
            Object.keys(mAttributes).forEach(function (sKey) {
                if (mAttributes[sKey] != null) {
                    oLink.setAttribute(sKey, mAttributes[sKey]);
                }
            });
        }
        function listener(oEvent) {
            var bError = oEvent.type === "error";
            oLink.setAttribute("data-sap-ui-ready", !bError);
            oLink.removeEventListener("load", listener);
            oLink.removeEventListener("error", listener);
            var fnCallback = bError ? fnErrorCallback : fnLoadCallback;
            if (typeof fnCallback === "function") {
                fnCallback();
            }
        }
        oLink.addEventListener("load", listener);
        oLink.addEventListener("error", listener);
        return oLink;
    };
    var sId = mAttributes && mAttributes.id;
    var oOld = document.getElementById(sId);
    var oLink = createLink();
    if (oOld && oOld.tagName === "LINK" && oOld.rel === "stylesheet") {
        if (typeof fnLoadCallback === "function" || typeof fnErrorCallback === "function" || oOld.href !== oLink.href) {
            if (oOld.getAttribute("data-sap-ui-foucmarker") === sId) {
                oOld.removeAttribute("id");
                oOld.parentNode.insertBefore(oLink, oOld);
            }
            else {
                oOld.parentNode.replaceChild(oLink, oOld);
            }
        }
        else if (oOld.getAttribute("data-sap-ui-foucmarker") === sId) {
            oOld.removeAttribute("data-sap-ui-foucmarker");
        }
    }
    else {
        var oCustomCss = document.getElementById("sap-ui-core-customcss");
        if (oCustomCss) {
            oCustomCss.parentNode.insertBefore(oLink, oCustomCss);
        }
        else {
            document.head.appendChild(oLink);
        }
    }
}
var fnIncludeStyleSheet = function includeStyleSheet(vUrl, vId, fnLoadCallback, fnErrorCallback) {
    var mAttributes;
    if (typeof vUrl === "string") {
        mAttributes = typeof vId === "string" ? { id: vId } : vId;
        _includeStyleSheet(vUrl, mAttributes, fnLoadCallback, fnErrorCallback);
    }
    else {
        assert(typeof vUrl === "object" && vUrl.url, "vUrl must be an object and requires a URL");
        mAttributes = Object.assign({}, vUrl.attributes);
        if (vUrl.id) {
            mAttributes.id = vUrl.id;
        }
        return new Promise(function (fnResolve, fnReject) {
            _includeStyleSheet(vUrl.url, mAttributes, fnResolve, fnReject);
        });
    }
};