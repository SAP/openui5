import _IconRegistry from "./_IconRegistry";
import library from "./library";
import encodeCSS from "sap/base/security/encodeCSS";
export class IconRenderer {
    static render(oRm: any, oControl: any) {
        var vIconInfo = _IconRegistry.getIconInfo(oControl.getSrc(), undefined, "mixed"), sWidth = oControl.getWidth(), sHeight = oControl.getHeight(), sColor = oControl.getColor(), sBackgroundColor = oControl.getBackgroundColor(), sSize = oControl.getSize(), sTitle = oControl._getOutputTitle(vIconInfo), aLabelledBy, oInvisibleText, oAccAttributes, bIconInfo = false;
        if (vIconInfo instanceof Promise) {
            vIconInfo.then(oControl.invalidate.bind(oControl));
        }
        else if (vIconInfo) {
            bIconInfo = true;
            aLabelledBy = oControl.getAriaLabelledBy();
            oAccAttributes = oControl._getAccessibilityAttributes(vIconInfo);
            oInvisibleText = oControl.getAggregation("_invisibleText");
        }
        oRm.openStart("span", oControl);
        oRm.class("sapUiIcon");
        if (bIconInfo) {
            oRm.accessibilityState(oControl, oAccAttributes);
            oRm.attr("data-sap-ui-icon-content", vIconInfo.content);
            oRm.style("font-family", "'" + encodeCSS(vIconInfo.fontFamily) + "'");
            if (!vIconInfo.suppressMirroring) {
                oRm.class("sapUiIconMirrorInRTL");
            }
        }
        if (oControl.hasListeners("press")) {
            oRm.class("sapUiIconPointer");
            if (!oControl.getNoTabStop()) {
                oRm.attr("tabindex", "0");
            }
        }
        oRm.style("width", sWidth);
        oRm.style("height", sHeight);
        oRm.style("line-height", sHeight);
        oRm.style("font-size", sSize);
        if (sColor && !(sColor in IconColor)) {
            oRm.style("color", sColor);
        }
        if (sBackgroundColor && !(sBackgroundColor in IconColor)) {
            oRm.style("background-color", sBackgroundColor);
        }
        oRm.openEnd();
        if (sTitle) {
            oRm.openStart("span").class("sapUiIconTitle").attr("title", sTitle).attr("aria-hidden", true).openEnd().close("span");
        }
        if (aLabelledBy && aLabelledBy.length && oInvisibleText) {
            oRm.renderControl(oInvisibleText);
        }
        oRm.close("span");
    }
}
var IconColor = library.IconColor;