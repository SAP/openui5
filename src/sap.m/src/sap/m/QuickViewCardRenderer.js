/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Lib"
], function(Core, Lib) {
	"use strict";

	/**
	 * QuickViewCard renderer.
	 * @namespace
	 */
	var QuickViewCardRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.QuickViewCard} oQuickViewCard an object representation of the control that should be rendered
	 */
	QuickViewCardRenderer.render = function (oRM, oQuickViewCard) {
		oRM.openStart("div", oQuickViewCard)
			.class("sapMQuickViewCard")
			.accessibilityState({
				label: {
					value: Lib.getResourceBundleFor("sap.m").getText("ARIA_ROLEDESCRIPTION_CARD"),
					append: true
				}
			});

		oRM.openEnd();
		oRM.renderControl(oQuickViewCard.getNavContainer());
		oRM.close("div");
	};

	return QuickViewCardRenderer;
}, /* bExport= */ true);