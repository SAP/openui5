import BlockLayerUtils from "./BlockLayerUtils";
var BusyIndicatorUtils = function () { };
BusyIndicatorUtils.getElement = function (sSize) {
    var sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
    if (sSize === "Large") {
        sSizeClass = "sapUiLocalBusyIndicatorSizeBig";
    }
    var oContainer = document.createElement("div");
    oContainer.className = "sapUiLocalBusyIndicator " + sSizeClass + " sapUiLocalBusyIndicatorFade";
    BlockLayerUtils.addAriaAttributes(oContainer);
    addAnimation(oContainer);
    return oContainer;
};
function addAnimation(oContainer, sSizeClass) {
    sSizeClass = sSizeClass || "sapUiLocalBusyIndicatorAnimStandard";
    var oAnimation = document.createElement("div");
    oAnimation.className = "sapUiLocalBusyIndicatorAnimation " + sSizeClass;
    oAnimation.appendChild(document.createElement("div"));
    oAnimation.appendChild(document.createElement("div"));
    oAnimation.appendChild(document.createElement("div"));
    oContainer.appendChild(oAnimation);
}
function handleAutoAnimationSize(oBusyBlockState, sSize) {
    var oParentDOM = oBusyBlockState.$parent.get(0), oBlockLayerDOM = oBusyBlockState.$blockLayer.get(0);
    var oAnimation = oBlockLayerDOM.children[0], iWidth = oAnimation.offsetWidth;
    if (oParentDOM.offsetWidth < iWidth) {
        oAnimation.className = "sapUiLocalBusyIndicatorAnimation sapUiLocalBusyIndicatorAnimSmall";
    }
}
BusyIndicatorUtils.addHTML = function (oBusyBlockState, sSize) {
    var BusyIndicatorSize = sap.ui.require("sap/ui/core/library").BusyIndicatorSize, sSizeClass = "sapUiLocalBusyIndicatorSizeMedium", sAnimationSizeClass;
    switch (sSize) {
        case BusyIndicatorSize.Small:
            sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
            sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimSmall";
            break;
        case BusyIndicatorSize.Large:
            sSizeClass = "sapUiLocalBusyIndicatorSizeBig";
            sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
            break;
        case BusyIndicatorSize.Auto:
            sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
            sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
            break;
        default:
            sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
            sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
            break;
    }
    if (!oBusyBlockState) {
        return;
    }
    var oParentDOM = oBusyBlockState.$parent.get(0), oBlockLayerDOM = oBusyBlockState.$blockLayer.get(0);
    oParentDOM.className += " sapUiLocalBusy";
    oBlockLayerDOM.className += " sapUiLocalBusyIndicator " + sSizeClass + " sapUiLocalBusyIndicatorFade";
    addAnimation(oBlockLayerDOM, sAnimationSizeClass);
    if (sSize === BusyIndicatorSize.Auto) {
        handleAutoAnimationSize(oBusyBlockState);
    }
};