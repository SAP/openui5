import _FeatureDetection from "sap/ui/util/_FeatureDetection";
import jQuery from "sap/ui/thirdparty/jquery";
var fnScroll;
if (_FeatureDetection.initialScrollPositionIsZero()) {
    fnScroll = function (oDomRef) {
        return (-oDomRef.scrollLeft);
    };
}
else {
    fnScroll = function (oDomRef) {
        return oDomRef.scrollWidth - oDomRef.scrollLeft - oDomRef.clientWidth;
    };
}
var fnScrollRightRTL = function () {
    var oDomRef = this.get(0);
    if (oDomRef) {
        return fnScroll(oDomRef);
    }
};
jQuery.fn.scrollRightRTL = fnScrollRightRTL;