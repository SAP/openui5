/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Core", "sap/ui/core/Lib"], function(Core, Lib) {
	"use strict";

	/**
	 * PlaceholderBase renderer.
	 *
	 * @namespace
	 * @alias sap.f.cards.loading.PlaceholderBaseRenderer
	 * @static
	 * @protected
	 */
	var PlaceholderBaseRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.f.cards.loading.PlaceholderBase} oControl An object representation of the control that should be rendered.
	 */
	PlaceholderBaseRenderer.render = function(oRm, oControl) {
		var oResBundle = Lib.getResourceBundleFor("sap.ui.core"),
			sTitle = oResBundle.getText("BUSY_TEXT");

		if (!oControl.getHasContent()) {
			return;
		}

		oRm.openStart("div", oControl)
			.class("sapFCardContentPlaceholder")
			.attr("tabindex", "0");
		this.addOuterAttributes(oControl, oRm);

		if (oControl.getRenderTooltip()) {
			oRm.attr("title", sTitle);
		}

		oRm.accessibilityState(oControl, {
			role: "progressbar",
			valuemin: "0",
			valuemax: "100"
		});
		oRm.openEnd();

		this.renderContent(oControl, oRm);

		oRm.close("div");
	};

	/**
	 * This method is reserved for derived classes to add their respective attributes.
	 *
	 * @protected
	 * @param {sap.f.cards.loading.PlaceholderBase} oControl An object representation of the control that should be rendered.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 */
	PlaceholderBaseRenderer.addOuterAttributes = function(oControl, oRm) {
	};

	/**
	 * This method is reserved for derived classes to render their respective content.
	 *
	 * @protected
	 * @param {sap.f.cards.loading.PlaceholderBase} oControl An object representation of the control that should be rendered.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 */
	PlaceholderBaseRenderer.renderContent = function(oControl, oRm) {
	};

	return PlaceholderBaseRenderer;

}, /* bExport= */ true);
