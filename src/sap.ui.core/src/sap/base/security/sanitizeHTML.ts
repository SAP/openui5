import assert from "sap/base/assert";
import URLListValidator from "sap/base/security/URLListValidator";
var fnSanitizeHTML = function (sHTML, mOptions) {
    assert(window.html && window.html.sanitize, "Sanitizer should have been loaded");
    mOptions = mOptions || {
        uriRewriter: function (sUrl) {
            if (URLListValidator.validate(sUrl)) {
                return sUrl;
            }
        }
    };
    var oTagPolicy = mOptions.tagPolicy || window.html.makeTagPolicy(mOptions.uriRewriter, mOptions.tokenPolicy);
    return window.html.sanitizeWithPolicy(sHTML, oTagPolicy);
};