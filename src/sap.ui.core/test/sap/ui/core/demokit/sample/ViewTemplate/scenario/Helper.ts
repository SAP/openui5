import AnnotationHelper from "sap/ui/model/odata/AnnotationHelper";
var rBadIdChars = /[^A-Za-z0-9_.:]/g;
function formatParts(oInterface, vRawValue) {
    var i, aResult;
    function formatLabelValue(oInterface, vRawValue0) {
        var sResult = AnnotationHelper.format(oInterface, vRawValue0);
        return oInterface.getPath().endsWith("/Label") ? "[" + sResult + "]" : sResult;
    }
    try {
        if (oInterface.getModel()) {
            return formatLabelValue(oInterface, vRawValue);
        }
        else {
            aResult = [];
            for (i = 0; oInterface.getModel(i); i += 1) {
                aResult.push(formatLabelValue(oInterface.getInterface(i), arguments[i + 1]));
            }
            return aResult.join(" ");
        }
    }
    catch (e) {
        return e.message;
    }
}
formatParts.requiresIContext = true;
function id(oInterface) {
    var i, sPath = oInterface.getPath(), aResult;
    if (sPath) {
        return sPath.replace(rBadIdChars, ".");
    }
    else {
        aResult = [];
        for (i = 0; oInterface.getPath(i); i += 1) {
            aResult.push(oInterface.getPath(i).replace(rBadIdChars, "."));
        }
        return aResult.join("::");
    }
}
id.requiresIContext = true;