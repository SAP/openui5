/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Core'],
	function(Core) {
		"use strict";

		/**
		 * QuickViewCard renderer.
		 * @namespace
		 */
		var QuickViewCardRenderer = {},
			oRb = Core.getLibraryResourceBundle("sap.m");

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager}
		 *          oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control}
		 *          oQuickView an object representation of the control that should be rendered
		 */
		QuickViewCardRenderer.render = function(oRm, oQuickViewCard) {

			var oContent = oQuickViewCard.getNavContainer();

			oRm.write("<div");
			oRm.addClass("sapMQuickViewCard");
			if (!oQuickViewCard.getShowVerticalScrollBar()) {
				oRm.addClass("sapMQuickViewCardNoScroll");
			}
			oRm.writeControlData(oQuickViewCard);
			oRm.writeClasses();

			// Accessibility state
			oRm.writeAccessibilityState(oQuickViewCard, {
				label: {value: oRb.getText("ARIA_ROLEDESCRIPTION_CARD"), append: true}
			});

			oRm.write(">");
			oRm.renderControl(oContent);
			oRm.write("</div>");
		};

		return QuickViewCardRenderer;

	}, /* bExport= */ true);
