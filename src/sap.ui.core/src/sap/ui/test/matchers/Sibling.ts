import Log from "sap/base/Log";
import Matcher from "sap/ui/test/matchers/Matcher";
var oLogger = Log.getLogger("sap.ui.test.matchers.Sibling");
var oMatcher = new Matcher();
function _getAggregatedControls(mAggregations) {
    var aResult = [];
    for (var sAggregation in mAggregations) {
        var vAggregation = mAggregations[sAggregation];
        if (Array.isArray(vAggregation)) {
            aResult = aResult.concat(vAggregation.slice(0, 20));
        }
        else if (vAggregation) {
            aResult.push(vAggregation);
        }
    }
    aResult = aResult.filter(function (oControl) {
        return oControl.getMetadata && oControl.getMetadata().getName() && oControl.$().length;
    });
    return aResult;
}