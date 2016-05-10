/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.dt.test.report.Table
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 */
	var TableRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oTable An object representation of the control that should be rendered.
	 */
	TableRenderer.render = function(rm, oTable) {
		rm.addClass("sapUiDtTableReport");

		rm.write("<div");
		rm.writeControlData(oTable);

		rm.writeStyles();

		rm.writeClasses();

		rm.write(">");

		rm.renderControl(oTable._getTable());

		rm.write("</div>");
	};

	return TableRenderer;

}, /* bExport= */ true);
