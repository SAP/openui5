/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";

		/**
		 * PagingButton renderer
		 * @namespace
		 */
		var PagingButtonRenderer = {};


		PagingButtonRenderer.render = function (oRm, oControl) {
			var nextButton = oControl._getNextButton(),
				prevButton = oControl._getPreviousButton();

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapMPagingButton");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(prevButton);
			oRm.renderControl(nextButton);
			oRm.write("</div>");
		};

		return PagingButtonRenderer;

	}, /* bExport= */ true);
