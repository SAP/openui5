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
		var sHeight = oWidget.getHeight();
		//start
		oRm.write("<div");
		oRm.writeElementData(oWidget);
		oRm.addClass("sapFCard");
		if (!oWidget.getWidgetContent()) {
			oRm.addClass("sapFCardNoContent");
		}
		oRm.writeClasses();

		oRm.addStyle("width", oWidget.getWidth());

		if (sHeight && sHeight !== 'auto') {
			oRm.addStyle("height", sHeight);
		}

		//Accessibility state
		oRm.writeAccessibilityState(oWidget, {
			role: "region",
			roledescription: {value: oRb.getText("ARIA_ROLEDESCRIPTION_CARD"), append: true}
		});
		oRm.writeStyles();
		oRm.write(">");

		//content
		WidgetRenderer.renderContentSection(oRm, oWidget);

		//end
		oRm.write("</div>");
	};

	/**
	 * Render content section.
	 * Will be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	WidgetRenderer.renderContentSection = function (oRm, oWidget) {
		var oContent = oWidget.getWidgetContent();

		if (oContent) {
			oRm.write("<div");
			oRm.addClass("sapFCardContent");
			oRm.writeClasses();
			//Accessibility configuration
			oRm.writeAccessibilityState(oWidget, {
				role: "group",
				label: {value: oRb.getText("ARIA_LABEL_CARD_CONTENT"), append: true}
			});
			oRm.write(">");

			oRm.renderControl(oContent);

			oRm.write("</div>");
		}
	};

	return WidgetRenderer;
});