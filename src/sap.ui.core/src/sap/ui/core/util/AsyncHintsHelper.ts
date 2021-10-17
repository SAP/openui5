export class AsyncHintsHelper {
    static modifyUrls(oAsyncHints: any, fnUrlModifier: any) {
        function _removeUrlIfUndefined(oAsyncHint, sUrl) {
            if (sUrl === undefined) {
                delete oAsyncHint.url;
            }
        }
        [oAsyncHints.components, oAsyncHints.libs].forEach(function (aItems) {
            if (Array.isArray(aItems)) {
                aItems.forEach(function (vAsyncHint) {
                    if (typeof vAsyncHint !== "object") {
                        return;
                    }
                    if (typeof vAsyncHint.url === "string") {
                        vAsyncHint.url = fnUrlModifier(vAsyncHint.url);
                        _removeUrlIfUndefined(vAsyncHint, vAsyncHint.url);
                    }
                    else if (typeof vAsyncHint.url === "object" && typeof vAsyncHint.url.url === "string") {
                        vAsyncHint.url.url = fnUrlModifier(vAsyncHint.url.url);
                        _removeUrlIfUndefined(vAsyncHint, vAsyncHint.url.url);
                    }
                });
            }
        });
        return oAsyncHints;
    }
}