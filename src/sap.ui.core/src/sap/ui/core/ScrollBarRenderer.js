/*!
 * ${copyright}
 */

// A renderer for the ScrollBar control
sap.ui.define(['sap/ui/Device', "sap/ui/dom/getScrollbarSize", "sap/ui/core/Configuration"],
	function(Device, getScrollbarSize, Configuration) {
	"use strict";


	/**
	 * ScrollBar renderer.
	 * @namespace
	 * @alias sap.ui.core.ScrollBarRenderer
	 */
	var ScrollBarRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.ScrollBar} oControl Object representation of the control that should be rendered
	 */
	ScrollBarRenderer.render = function(oRM, oScrollBar){
		var bRTL = Configuration.getRTL();

		oRM.openStart("div", oScrollBar);
		oRM.class("sapUiScrollBar");

		var sScrollBarTouchClass;
		if (Device.support.touch) {
			sScrollBarTouchClass = "sapUiScrollBarTouch";
			oRM.class(sScrollBarTouchClass);
		}

		// Get Properties
		var bVertical = oScrollBar.getVertical();
		var sSize = oScrollBar.getSize();
		var sContentSize = oScrollBar.getContentSize();

		var oBSS = getScrollbarSize(sScrollBarTouchClass);
		var sWidth = oBSS.width;
		var sHeight = oBSS.height;

		if (bVertical) {
			// First div. <div style="overflow:hidden;width:16px;height:200px">
			oRM.style("overflow", "hidden");
			oRM.style("width", sWidth + "px");
			oRM.style("height", sSize);
			oRM.openEnd();

			// Middle div - ScrollBar itself.
			oRM.openStart("div", oScrollBar.getId() + "-sb");
			oRM.style("width", (sWidth * 2) + "px");
			oRM.style("height", "100%");
			oRM.style("overflow-y", "scroll");
			oRM.style("overflow-x", "hidden");
			if (bRTL) {
				oRM.style("margin-right", "-" + sWidth + "px");
			} else {
				oRM.style("margin-left", "-" + sWidth + "px");
			}
			oRM.openEnd();

			//Last div - The content div <div style="height:1000px;width:16px"></div>
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

		} else {

			// Horizontal Scrollbar
			// First div.    <div style="width:200px;height:16px;overflow:hidden">
			oRM.style("overflow", "hidden");
			oRM.style("height", sHeight + "px");
			oRM.style("width", sSize);
			oRM.openEnd();

			// Middle div - ScrollBar itself.
			oRM.openStart("div", oScrollBar.getId() + "-sb");
			oRM.style("height", (sHeight * 2) + "px");
			oRM.style("margin-top", "-" + sHeight + "px");
			oRM.style("overflow-x", "scroll");
			oRM.style("overflow-y", "hidden");
			oRM.openEnd();

			//Last div - The content div   <div style="width:1000px;height:16px;"></div>
			oRM.openStart("div", oScrollBar.getId() + "-sbcnt");
			oRM.style("height", sHeight + "px");
			oRM.style("width", sContentSize);
			oRM.openEnd();
			oRM.close("div");
			oRM.close("div");
		}
		oRM.close("div");
	};


	/* PURE HTML EXAMPLE, FOR TESTING, FOR EXAMPLE IE9 SCROLLING PROBLEM:
	 * <h1>vertical</h1>
	 * <div style="width:16px;height:200px;overflow:hidden">
	 * <div style="width:32px;height:100%;margin-left:-16px;overflow-y:scroll;overflow-x:hidden" onscroll="document.getElementById('v').innerHTML = this.scrollTop">
	 * <div style="height:1000px;width:16px"></div>
	 * </div>
	 * </div>
	 * <div id="v"></div>

	 * <h1>horizontal</h1>
	 * <div style="width:200px;height:16px;overflow:hidden">
	 * <div style="width:100%;height:32px;margin-top:-16px;overflow-x:scroll;overflow-y:hidden" onscroll="document.getElementById('h').innerHTML = this.scrollLeft">
	 * <div style="width:1000px;height:16px;"></div>
	 * </div>
	 * </div>
	 * <div id="h"></div>
	 */

	return ScrollBarRenderer;

}, /* bExport= */ true);