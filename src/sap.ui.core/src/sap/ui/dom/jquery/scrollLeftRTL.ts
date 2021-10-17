import denormalizeScrollLeftRTL from "sap/ui/dom/denormalizeScrollLeftRTL";
import _FeatureDetection from "sap/ui/util/_FeatureDetection";
import jQuery from "sap/ui/thirdparty/jquery";
var fnScroll;
if (_FeatureDetection.initialScrollPositionIsZero()) {
    fnScroll = function (oDomRef) {
        return oDomRef.scrollWidth + oDomRef.scrollLeft - oDomRef.clientWidth;
    };
}
else {
    fnScroll = function (oDomRef) {
        return oDomRef.scrollLeft;
    };
}
var fnScrollLeftRTL = function (iPos) {
    var oDomRef = this.get(0);
    if (oDomRef) {
        if (iPos === undefined) {
            return fnScroll(oDomRef);
        }
        else {
            oDomRef.scrollLeft = denormalizeScrollLeftRTL(iPos, oDomRef);
            return this;
        }
    }
};
jQuery.fn.scrollLeftRTL = fnScrollLeftRTL;