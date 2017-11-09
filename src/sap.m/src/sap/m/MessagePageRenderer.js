/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.MessagePage
sap.ui.define([],
		function() {
			"use strict";


			/**
			 * MessagePage renderer.
			 * @namespace
			 */
			var MessagePageRenderer = {};

			/**
			 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
			 *
			 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
			 * @param {sap.ui.core.Control} oMessagePage an object representation of the control that should be rendered
			 * @returns {sap.m.MessagePageRenderer} this instance for chaining
			 */
			MessagePageRenderer.render = function(oRm, oMessagePage) {
				oRm.write("<div");
				oRm.writeControlData(oMessagePage);
				oRm.addClass("sapMMessagePage");
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oMessagePage.getAggregation("_page"));
				oRm.write("</div>");
			};

			return MessagePageRenderer;

		}, /* bExport= */ true);
