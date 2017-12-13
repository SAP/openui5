/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/ValueStateSupport', 'sap/ui/core/library'],
	function(ValueStateSupport, coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	/**
	 * ObjectStatus renderer.
	 * @namespace
	 */
	var ObjectStatusRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oObjStatus An object representation of the control that should be rendered
	 */
	ObjectStatusRenderer.render = function(oRm, oObjStatus){
		oRm.write("<div");

		if (oObjStatus._isEmpty()) {
			oRm.writeControlData(oObjStatus);
			oRm.addStyle("display", "none");
			oRm.writeStyles();
			oRm.write(">");
		} else {

			var sState = oObjStatus.getState();
			var sTextDir = oObjStatus.getTextDirection();
			var bPageRTL = sap.ui.getCore().getConfiguration().getRTL();

			if (sTextDir === TextDirection.Inherit) {
				sTextDir = bPageRTL ? TextDirection.RTL : TextDirection.LTR;
			}

			oRm.writeControlData(oObjStatus);

			var sTooltip = oObjStatus.getTooltip_AsString();
			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			oRm.addClass("sapMObjStatus");
			oRm.addClass("sapMObjStatus" + sState);

			if (oObjStatus._isActive()) {
				oRm.addClass("sapMObjStatusActive");
				oRm.writeAttribute("tabindex", "0");
				oRm.writeAccessibilityState(oObjStatus, {
					role: "link"
				});
			}

			oRm.writeClasses();

			/* ARIA region adding the aria-describedby to ObjectStatus */

			if (sState != ValueState.None) {
				oRm.writeAccessibilityState(oObjStatus, {
					describedby: {
						value: oObjStatus.getId() + "sapSRH",
						append: true
					}
				});
			}

			oRm.write(">");

			if (oObjStatus.getTitle()) {

				oRm.write("<span");
				oRm.writeAttributeEscaped("id", oObjStatus.getId() + "-title");
				oRm.addClass("sapMObjStatusTitle");

				if (sTextDir) {
					oRm.writeAttribute("dir", sTextDir.toLowerCase());
				}
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(oObjStatus.getTitle() + ":");
				oRm.write("</span>");
			}

			if (oObjStatus._isActive()) {
				oRm.write("<span");
				oRm.writeAttributeEscaped("id", oObjStatus.getId() + "-link");
				oRm.addClass("sapMObjStatusLink");
				oRm.writeClasses();
				oRm.write(">");
			}

			if (oObjStatus.getIcon()) {
				oRm.write("<span");
				oRm.writeAttributeEscaped("id", oObjStatus.getId() + "-icon");
				oRm.addClass("sapMObjStatusIcon");
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oObjStatus._getImageControl());
				oRm.write("</span>");
			}

			if (oObjStatus.getText()) {
				oRm.write("<span");
				oRm.writeAttributeEscaped("id", oObjStatus.getId() + "-text");
				oRm.addClass("sapMObjStatusText");

				if (sTextDir) {
					oRm.writeAttribute("dir", sTextDir.toLowerCase());
				}

				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(oObjStatus.getText());
				oRm.write("</span>");
			}

			if (oObjStatus._isActive()) {
				oRm.write("</span>");
			}
			/* ARIA adding hidden node in span element */
			if (sState != ValueState.None) {
				oRm.write("<span");
				oRm.writeAttributeEscaped("id", oObjStatus.getId() + "sapSRH");
				oRm.addClass("sapUiInvisibleText");
				oRm.writeClasses();
				oRm.writeAccessibilityState({
					hidden: false
				});
				oRm.write(">");
				oRm.writeEscaped(ValueStateSupport.getAdditionalText(sState));
				oRm.write("</span>");
			}

		}

		oRm.write("</div>");
	};

	return ObjectStatusRenderer;

}, /* bExport= */ true);
