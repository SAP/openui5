/*!
 * ${copyright}
 */

sap.ui.define([],
	function () {
		"use strict";

		/**
		 * FilterBar renderer.
		 * @namespace
		 */
		const FilterBarBaseRenderer = {
			apiVersion: 2
		};

		/**
		 * CSS class to be applied to the HTML root element of the {@link sap.ui.mdc.FilterBar FilterBar} control.
		 *
		 * @readonly
		 * @const {string}
		 */
		FilterBarBaseRenderer.CSS_CLASS = "sapUiMdcFilterBarBase";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.mdc.filterbar.FilterBarBase} oControl An object representation of the control that should be rendered
		 */
		FilterBarBaseRenderer.render = function (oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.class(FilterBarBaseRenderer.CSS_CLASS);
			if (oControl.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar") && oControl.getProperty("_useFixedWidth")) {
				oRm.style("width", oControl.getWidth());
			}
			oRm.openEnd();
			const oInnerLayout = oControl.getAggregation("layout") ? oControl.getAggregation("layout").getInner() : null;
			oRm.renderControl(oInnerLayout);
			oRm.close("div");
		};

		return FilterBarBaseRenderer;
	}, true);
