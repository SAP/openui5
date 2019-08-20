/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.integration.Widget
sap.ui.define([
], function (
) {
	"use strict";
	/**
	 * <code>Widget</code> renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var WidgetRenderer = {},
		oRb = sap.ui.getCore().getLibraryResourceBundle("sap.f");

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oWidget an object representation of the control that should be rendered
	 */
	WidgetRenderer.render = function (oRm, oWidget) {
		var oContent = oWidget.getAggregation("_content");

		//start
		oRm.write("<div");
		oRm.writeElementData(oWidget);
		oRm.writeClasses();

		//Accessibility state
		oRm.writeAccessibilityState(oWidget, {
			role: "region",
			roledescription: {value: oRb.getText("ARIA_ROLEDESCRIPTION_CARD"), append: true}
		});
		oRm.write(">");

		if (oContent) {
			oRm.renderControl(oContent);
		}

		//end
		oRm.write("</div>");
	};

	return WidgetRenderer;
});
