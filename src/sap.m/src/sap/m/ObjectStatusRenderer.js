/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/ValueStateSupport', 'sap/ui/core/IndicationColorSupport', 'sap/ui/core/InvisibleText', 'sap/ui/core/library'],
	function(ValueStateSupport, IndicationColorSupport, InvisibleText, coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	/**
	 * ObjectStatus renderer.
	 * @namespace
	 */
	var ObjectStatusRenderer = {
			apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oObjStatus An object representation of the control that should be rendered
	 */
	ObjectStatusRenderer.render = function(oRm, oObjStatus){
		oRm.openStart("div", oObjStatus);

		if (oObjStatus._isEmpty()) {
			oRm.style("display", "none");
			oRm.openEnd();
		} else {

			var sState = oObjStatus.getState();
			var bInverted = oObjStatus.getInverted();
			var sTextDir = oObjStatus.getTextDirection();
			var oCore = sap.ui.getCore();
			var bPageRTL = oCore.getConfiguration().getRTL();
			var oAccAttributes = {
				roledescription: oCore.getLibraryResourceBundle("sap.m").getText("OBJECT_STATUS")
			};

			if (sTextDir === TextDirection.Inherit) {
				sTextDir = bPageRTL ? TextDirection.RTL : TextDirection.LTR;
			}

			var sTooltip = oObjStatus.getTooltip_AsString();
			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}

			oRm.class("sapMObjStatus");
			oRm.class("sapMObjStatus" + sState);
			if (bInverted) {
				oRm.class("sapMObjStatusInverted");
			}

			if (oObjStatus._isActive()) {
				oRm.class("sapMObjStatusActive");
				oRm.attr("tabindex", "0");
				oAccAttributes.role = "button";
			} else {
				oAccAttributes.role = "group";
			}

			if (oObjStatus._oInvisibleText) {
				oAccAttributes["describedby"] = { value: oObjStatus._oInvisibleText.getId(), append: true };
			}

			oRm.accessibilityState(oObjStatus, oAccAttributes);

			oRm.openEnd();

			if (oObjStatus.getTitle()) {

				oRm.openStart("span", oObjStatus.getId() + "-title");
				oRm.class("sapMObjStatusTitle");

				if (sTextDir) {
					oRm.attr("dir", sTextDir.toLowerCase());
				}
				oRm.openEnd();
				oRm.text(oObjStatus.getTitle() + ":");
				oRm.close("span");
			}

			if (oObjStatus._isActive()) {
				oRm.openStart("span", oObjStatus.getId() + "-link");
				oRm.class("sapMObjStatusLink");
				oRm.openEnd();
			}

			if (oObjStatus.getIcon()) {
				oRm.openStart("span", oObjStatus.getId() + "-statusIcon");
				oRm.class("sapMObjStatusIcon");
				if (!oObjStatus.getText()) {
					oRm.class("sapMObjStatusIconOnly");
				}
				oRm.openEnd();
				oRm.renderControl(oObjStatus._getImageControl());
				oRm.close("span");
			}

			if (oObjStatus.getText()) {
				oRm.openStart("span", oObjStatus.getId() + "-text");
				oRm.class("sapMObjStatusText");

				if (sTextDir) {
					oRm.attr("dir", sTextDir.toLowerCase());
				}

				oRm.openEnd();
				oRm.text(oObjStatus.getText());
				oRm.close("span");
			}

			if (oObjStatus._isActive()) {
				oRm.close("span");
			}
		}

		oRm.close("div");
	};

	return ObjectStatusRenderer;

}, /* bExport= */ true);
