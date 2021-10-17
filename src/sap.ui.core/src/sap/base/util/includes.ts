import values from "sap/base/util/values";
var fnIncludes = function (vCollection, vValue, iFromIndex) {
    if (typeof iFromIndex !== "number") {
        iFromIndex = 0;
    }
    if (Array.isArray(vCollection) || typeof vCollection === "string") {
        if (iFromIndex < 0) {
            iFromIndex = (vCollection.length + iFromIndex) < 0 ? 0 : vCollection.length + iFromIndex;
        }
        return vCollection.includes(vValue, iFromIndex);
    }
    else {
        return fnIncludes(values(vCollection), vValue, iFromIndex);
    }
};