import Device from "sap/ui/Device";
import getScrollbarSize from "sap/ui/dom/getScrollbarSize";
export class ScrollBarRenderer {
    static render(oRM: any, oScrollBar: any) {
        var bRTL = sap.ui.getCore().getConfiguration().getRTL();
        oRM.openStart("div", oScrollBar);
        oRM.class("sapUiScrollBar");
        var sScrollBarTouchClass;
        if (Device.support.touch) {
            sScrollBarTouchClass = "sapUiScrollBarTouch";
            oRM.class(sScrollBarTouchClass);
        }
        var bVertical = oScrollBar.getVertical();
        var sSize = oScrollBar.getSize();
        var sContentSize = oScrollBar.getContentSize();
        var oBSS = getScrollbarSize(sScrollBarTouchClass);
        var sWidth = oBSS.width;
        var sHeight = oBSS.height;
        if (bVertical) {
            oRM.style("overflow", "hidden");
            oRM.style("width", sWidth + "px");
            oRM.style("height", sSize);
            oRM.openEnd();
            oRM.openStart("div", oScrollBar.getId() + "-sb");
            oRM.style("width", (sWidth * 2) + "px");
            oRM.style("height", "100%");
            oRM.style("overflow-y", "scroll");
            oRM.style("overflow-x", "hidden");
            if (bRTL) {
                oRM.style("margin-right", "-" + sWidth + "px");
            }
            else {
                oRM.style("margin-left", "-" + sWidth + "px");
            }
            oRM.openEnd();
            oRM.openStart("div", oScrollBar.getId() + "-sbcnt");
            oRM.style("width", sWidth + "px");
            oRM.style("height", sContentSize);
            oRM.openEnd();
            oRM.close("div");
            oRM.close("div");
            oRM.openStart("div");
            oRM.openEnd();
            oRM.openStart("span", oScrollBar.getId() + "-ffsize");
            oRM.style("position", "absolute");
            oRM.style("top", "-9000px");
            oRM.style("left", "-9000px");
            oRM.style("visibility", "hidden");
            oRM.style("line-height", "normal");
            oRM.openEnd();
            oRM.text("FF Size");
            oRM.close("span");
            oRM.close("div");
        }
        else {
            oRM.style("overflow", "hidden");
            oRM.style("height", sHeight + "px");
            oRM.style("width", sSize);
            oRM.openEnd();
            oRM.openStart("div", oScrollBar.getId() + "-sb");
            oRM.style("height", (sHeight * 2) + "px");
            oRM.style("margin-top", "-" + sHeight + "px");
            oRM.style("overflow-x", "scroll");
            oRM.style("overflow-y", "hidden");
            oRM.openEnd();
            oRM.openStart("div", oScrollBar.getId() + "-sbcnt");
            oRM.style("height", sHeight + "px");
            oRM.style("width", sContentSize);
            oRM.openEnd();
            oRM.close("div");
            oRM.close("div");
        }
        oRM.close("div");
    }
}