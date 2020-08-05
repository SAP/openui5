/*!
 * ${copyright}
 */
sap.ui.define(
	[],
	function() {
		"use strict";

		/**
		 * BusyIndicator renderer.
		 * @namespace
		 */
		var BusyIndicatorRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oBusyInd an object representation of the control that should be rendered
		 */
		BusyIndicatorRenderer.render = function(oRm, oBusyInd) {
			var sTooltip = oBusyInd.getTooltip_AsString();

			oRm.openStart("div", oBusyInd).class("sapMBusyIndicator");
			oRm.style("font-size", oBusyInd.getSize());
			oRm.accessibilityState(oBusyInd);

			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}

			oRm.openEnd();

			if (oBusyInd.getCustomIcon()) {
				oRm.renderControl(oBusyInd._iconImage);
			} else {
				oRm.openStart("div", oBusyInd.getId() + "-busy-area");
				oRm.class("sapMBusyIndicatorBusyArea").openEnd().close("div");
			}

			if (oBusyInd._busyLabel) {
				oRm.renderControl(oBusyInd._busyLabel);
			}
			oRm.close("div");
		};

		return BusyIndicatorRenderer;
	},	/* bExport= */ true );
