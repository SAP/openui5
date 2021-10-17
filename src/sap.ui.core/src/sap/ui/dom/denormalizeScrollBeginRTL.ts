import _FeatureDetection from "sap/ui/util/_FeatureDetection";
var fnDenormalize;
if (_FeatureDetection.initialScrollPositionIsZero()) {
    fnDenormalize = function (iNormalizedScrollBegin, oDomRef) {
        return -iNormalizedScrollBegin;
    };
}
else {
    fnDenormalize = function (iNormalizedScrollBegin, oDomRef) {
        return oDomRef.scrollWidth - oDomRef.clientWidth - iNormalizedScrollBegin;
    };
}
var fnDenormalizeScrollBeginRTL = function (iNormalizedScrollBegin, oDomRef) {
    if (oDomRef) {
        return fnDenormalize(iNormalizedScrollBegin, oDomRef);
    }
};