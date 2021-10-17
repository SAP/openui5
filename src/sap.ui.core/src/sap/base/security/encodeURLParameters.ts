import encodeURL from "./encodeURL";
var fnEncodeURLParameters = function (mParams) {
    if (!mParams) {
        return "";
    }
    var aUrlParams = [];
    Object.keys(mParams).forEach(function (sName) {
        var oValue = mParams[sName];
        if (oValue instanceof String || typeof oValue === "string") {
            oValue = encodeURL(oValue);
        }
        aUrlParams.push(encodeURL(sName) + "=" + oValue);
    });
    return aUrlParams.join("&");
};