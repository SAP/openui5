/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.RadioButtonGroup
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Core"
], function (coreLibrary, Core) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	/**
	 * RadioButtonGroup renderer.
	 * @namespace
	 */
	var RadioButtonGroupRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.RadioButtonGroup} oRBGroup an object representation of the control that should be rendered
	 */
	RadioButtonGroupRenderer.render = function(oRM, oRBGroup) {

		// Return immediately if control has no RadioButtons
		if (!oRBGroup.aRBs) {
			return;
		}

		// Should render only visible buttons
		var aVisibleRBs = oRBGroup.aRBs.filter(function (oButton) { return oButton.getVisible(); });

		var iColumns = oRBGroup.getColumns();
		var sControlTextDir = oRBGroup.getTextDirection();
		var bGlobalTextDir = Core.getConfiguration().getRTL();

		oRM.openStart("div", oRBGroup)
			.class("sapMRbG");

		if (!oRBGroup.getEditable()) {
			oRM.class("sapMRbGRo");
		}

		if (iColumns > 1) {
			if (iColumns == aVisibleRBs.length) {
				oRM.class("sapMRbG1Row");
			} else {
				oRM.class("sapMRbGTab");
			}
		}

		if (oRBGroup.getWidth()) {
			oRM.style("width", oRBGroup.getWidth());
		}

		if (oRBGroup.getTooltip_AsString()) {
			oRM.attr("title", oRBGroup.getTooltip_AsString());
		}

		// check global rtl config and textDirection property and add "dir" attribute
		if (!bGlobalTextDir && sControlTextDir != TextDirection.Inherit) {
			oRM.attr("dir", sControlTextDir.toLowerCase());
		}

		// ARIA
		oRM.accessibilityState(oRBGroup, {
			role: "radiogroup"
		});

		oRM.openEnd();

		// columns
		for (var c = 0; c < iColumns; c++) {
			if (iColumns > 1 && iColumns != aVisibleRBs.length) {
				// if only 1 column -> no DIV necessary
				oRM.openStart("div")
					.class("sapMRbGCol")
					.openEnd();
			}

			// render RadioButtons
			for (var i = c; i < aVisibleRBs.length; i = i + iColumns) {
				oRM.renderControl(aVisibleRBs[i]);
			}

			if (iColumns > 1 && iColumns != aVisibleRBs.length) {
				oRM.close("div");
			}
		}

		if (iColumns > 1 && iColumns != aVisibleRBs.length) {
			// dummy Column to avoid big spaces between RadioButtons in Safari
			oRM.openStart("div").class("sapMRbGDummy").openEnd().close("div");
		}

		oRM.close("div");
	};

	return RadioButtonGroupRenderer;
}, /* bExport= */ true);