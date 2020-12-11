/*!
 * ${copyright}
 */

sap.ui.define(['./library'],
	function(library) {
		"use strict";

		/**
		 * Chart renderer.
		 * @namespace
		 */
		var ChartRenderer = {
			apiVersion: 2
		};

		/**
		 * CSS class to be applied to the HTML root element of the control.
		 *
		 * @readonly
		 * @const {string}
		 */
		ChartRenderer.CSS_CLASS = "sapUiMDCChart";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		ChartRenderer.render = function(oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.class(ChartRenderer.CSS_CLASS);
			oRm.class("sapUiFixFlex");
			oRm.style("overflow", "hidden");
			oRm.style("height", oControl.getHeight());
			oRm.style("width", oControl.getWidth());
			oRm.style("min-height", oControl.getMinHeight());
			oRm.style("min-width", oControl.getMinWidth());
			oRm.openEnd();
			this.renderToolbar(oRm, oControl.getAggregation("_toolbar"));
			this.renderBreadcrumbs(oRm, oControl.getAggregation("_breadcrumbs"));
			this.renderChart(oRm, oControl.getAggregation("_chart"));
			this.renderNoDataStruct(oRm, oControl.getAggregation("_noDataStruct"));
			oRm.close("div");
		};

		ChartRenderer.renderNoDataStruct = function(oRm, oNoDataStruct) {
			if (oNoDataStruct) {
				oRm.openStart("div");
				oRm.class("sapUiFixFlexFlexibleContainer");
				oRm.openEnd();
				oRm.renderControl(oNoDataStruct);
				oRm.close("div");
			}
		};

		ChartRenderer.renderToolbar = function(oRm, oToolbar) {

			if (oToolbar) {
				oRm.openStart("div");
				oRm.class("sapUiFixFlexFixed");
				oRm.openEnd();
				oRm.renderControl(oToolbar);
				oRm.close("div");
			}
		};

		ChartRenderer.renderBreadcrumbs = function(oRm, oDrillBreadcrumbs) {

			if (oDrillBreadcrumbs) {
				oRm.renderControl(oDrillBreadcrumbs);
			}
		};

		ChartRenderer.renderChart = function(oRm, oChart) {

			if (oChart) {
				oRm.openStart("div");
				oRm.class("sapUiFixFlexFlexible");
				oRm.style("overflow", "hidden");
				oRm.openEnd();
				oRm.openStart("div");
				oRm.class("sapUiFixFlexFlexibleContainer");
				oRm.openEnd();
				oRm.renderControl(oChart);
				oRm.close("div");
				oRm.close("div");
			}
		};

		return ChartRenderer;
	}, true);
