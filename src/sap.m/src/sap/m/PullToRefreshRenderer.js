/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/IconPool'],
	function(IconPool) {
	"use strict";

// TODO: consider making this conditional
	IconPool.insertFontFaceStyle();

	/**
	 * PullToRefresh renderer.
	 * @namespace
	 */
	var PullToRefreshRenderer = {
		apiVersion: 2
	};

	/**
	 * Writes the accessibility state to the control's root element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.PullToRefresh} oControl An object representation of the control that should be rendered.
	 */
	PullToRefreshRenderer.writeAccessibilityState = function(oRm, oControl) {

		var oAccAttributes = {
			role: "button",
			controls: oControl.getParent().sId + "-cont",
			keyshortcuts: "F5",
			describedby: oControl._getAriaDescribedByReferences()
		};

		oRm.accessibilityState(oControl, oAccAttributes);
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.PullToRefresh} oControl an object representation of the control that should be rendered
	 */
	PullToRefreshRenderer.render = function(oRm, oControl){
		var bShowIcon = oControl.getShowIcon();
		var sCustomIcon = oControl.getCustomIcon();
		var sTooltip = oControl.getTooltip_AsString();
		var oResourceBundle = oControl._getRB();

		oRm.openStart("div", oControl);
		oRm.class("sapMPullDown");

		oRm.class(!oControl._bTouchMode ? "sapMPullDownNontouch" : "sapMPullDownTouch");

		if (bShowIcon && !sCustomIcon) { // if no custom icon is provided, use SAP logo as background
			oRm.class("sapMPullDownLogo");
		}

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.attr("tabindex", 0);

		this.writeAccessibilityState(oRm, oControl);

		oRm.openEnd();

		if (bShowIcon && sCustomIcon) {
			var oCustomImage = oControl.getCustomIconImage();
			if (oCustomImage) {
				oRm.openStart("div").class("sapMPullDownCI").openEnd();
				oRm.renderControl(oCustomImage);
				oRm.close("div");
			}
		}

		// Pull down arrow icon
		oRm.openStart("span").class("sapMPullDownIcon").openEnd().close("span");

		// Busy Indicator
		oRm.openStart("span").class("sapMPullDownBusy").openEnd();
		oRm.renderControl(oControl._oBusyIndicator);
		oRm.close("span");

		// Text - Pull down to refresh
		oRm.openStart("span", oControl.getId() + "-T");
		oRm.class("sapMPullDownText");
		oRm.attr("aria-live", "assertive");
		oRm.openEnd();
		oRm.text(oResourceBundle.getText(oControl._bTouchMode ? "PULL2REFRESH_PULLDOWN" : "PULL2REFRESH_REFRESH"));
		oRm.close("span");

		// Info - last updated at xx:xx:xx
		oRm.openStart("span", oControl.getId() + "-I");
		oRm.class("sapMPullDownInfo");
		oRm.openEnd();
		oRm.text(oControl.getDescription());
		oRm.close("span");

		oRm.close("div");
	};


	return PullToRefreshRenderer;

}, /* bExport= */ true);
