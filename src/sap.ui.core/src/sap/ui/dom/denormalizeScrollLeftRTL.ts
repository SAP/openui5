import _FeatureDetection from "sap/ui/util/_FeatureDetection";
var fnDenormalize;
if (_FeatureDetection.initialScrollPositionIsZero()) {
    fnDenormalize = function (iNormalizedScrollLeft, oDomRef) {
        return oDomRef.clientWidth + iNormalizedScrollLeft - oDomRef.scrollWidth;
    };
}
else {
    fnDenormalize = function (iNormalizedScrollLeft, oDomRef) {
        return iNormalizedScrollLeft;
    };
}
var fnDenormalizeScrollLeftRTL = function (iNormalizedScrollLeft, oDomRef) {
    if (oDomRef) {
        return fnDenormalize(iNormalizedScrollLeft, oDomRef);
    }
};