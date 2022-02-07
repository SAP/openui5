/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core"
], function (Core) {
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
					value: Core.getLibraryResourceBundle("sap.m").getText("ARIA_ROLEDESCRIPTION_CARD"),
					append: true
				}
			});

		if (!oQuickViewCard.getShowVerticalScrollBar()) {
			oRM.class("sapMQuickViewCardNoScroll");
		}

		oRM.openEnd();
		oRM.renderControl(oQuickViewCard.getNavContainer());
		oRM.close("div");
	};

	return QuickViewCardRenderer;
}, /* bExport= */ true);