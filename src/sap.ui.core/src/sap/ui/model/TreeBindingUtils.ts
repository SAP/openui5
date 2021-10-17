var TreeBindingUtils = function () { };
TreeBindingUtils.mergeSections = function (aSections, oNewSection) {
    var aNewSections = [];
    for (var i = 0; i < aSections.length; i++) {
        var oCurrentSection = aSections[i];
        var iCurrentSectionEndIndex = oCurrentSection.startIndex + oCurrentSection.length;
        var iNewSectionEndIndex = oNewSection.startIndex + oNewSection.length;
        if (oNewSection.startIndex <= iCurrentSectionEndIndex && iNewSectionEndIndex >= iCurrentSectionEndIndex && oNewSection.startIndex >= oCurrentSection.startIndex) {
            oNewSection.startIndex = oCurrentSection.startIndex;
            oNewSection.length = iNewSectionEndIndex - oCurrentSection.startIndex;
        }
        else if (oNewSection.startIndex <= oCurrentSection.startIndex && iNewSectionEndIndex >= oCurrentSection.startIndex && iNewSectionEndIndex <= iCurrentSectionEndIndex) {
            oNewSection.length = iCurrentSectionEndIndex - oNewSection.startIndex;
        }
        else if (oNewSection.startIndex >= oCurrentSection.startIndex && iNewSectionEndIndex <= iCurrentSectionEndIndex) {
            oNewSection.startIndex = oCurrentSection.startIndex;
            oNewSection.length = oCurrentSection.length;
        }
        else if (iNewSectionEndIndex < oCurrentSection.startIndex || oNewSection.startIndex > iCurrentSectionEndIndex) {
            aNewSections.push(oCurrentSection);
        }
    }
    aNewSections.push(oNewSection);
    return aNewSections;
};
TreeBindingUtils._determineRequestDelta = function (oNewRequest, oPendingRequest) {
    var iNewSectionEndIndex = oNewRequest.iSkip + oNewRequest.iTop;
    var iPendingSectionEndIndex = oPendingRequest.iSkip + oPendingRequest.iTop;
    if (oNewRequest.iSkip === oPendingRequest.iSkip && oNewRequest.iTop === oPendingRequest.iTop) {
        return false;
    }
    else if (oNewRequest.iSkip < oPendingRequest.iSkip && iNewSectionEndIndex > oPendingRequest.iSkip && iNewSectionEndIndex <= iPendingSectionEndIndex) {
        oNewRequest.iTop = oPendingRequest.iSkip - oNewRequest.iSkip;
        if (oNewRequest.iThreshold) {
            oNewRequest.iTop = oNewRequest.iTop + oNewRequest.iThreshold;
            oNewRequest.iSkip = Math.max(0, oNewRequest.iSkip - oNewRequest.iThreshold);
            oNewRequest.iThreshold = 0;
        }
    }
    else if (oNewRequest.iSkip < iPendingSectionEndIndex && iNewSectionEndIndex > iPendingSectionEndIndex && oNewRequest.iSkip >= oPendingRequest.iSkip) {
        oNewRequest.iSkip = iPendingSectionEndIndex;
        oNewRequest.iTop = iNewSectionEndIndex - oNewRequest.iSkip;
        if (oNewRequest.iThreshold) {
            oNewRequest.iTop += oNewRequest.iThreshold;
            oNewRequest.iThreshold = 0;
        }
    }
    else if (oNewRequest.iSkip >= oPendingRequest.iSkip && iNewSectionEndIndex <= iPendingSectionEndIndex) {
        return false;
    }
    else if (oNewRequest.iSkip <= oPendingRequest.iSkip && iNewSectionEndIndex >= iPendingSectionEndIndex) {
        oPendingRequest.oRequestHandle.abort();
    }
    else if (iNewSectionEndIndex <= oPendingRequest.iSkip || oNewRequest.iSkip >= iPendingSectionEndIndex) {
    }
};