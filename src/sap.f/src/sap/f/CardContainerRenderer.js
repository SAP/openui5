/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";

		/**
		 * CardContainer renderer
		 * @namespace
		 */
		var CardContainerRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} control an object representation of the control that should be rendered
		 */
		CardContainerRenderer.render = function(rm, control) {

			rm.write('<div');
			rm.writeControlData(control);

			rm.addClass("sapFCardContainer");
			rm.writeClasses();

			// Add inline styles
			if (control.getHeight()) {
				rm.addStyle("height", control.getHeight());
			}
			if (control.getWidth()) {
				rm.addStyle("width", control.getWidth());
			}
			rm.writeStyles();

			// Add tooltip
			var tooltip = control.getTooltip_AsString();
			if (tooltip) {
				rm.writeAttributeEscaped("title", tooltip);
			}

			// Close opening tag
			rm.write(">");

			control.getItems().forEach(function (item) {

				rm.write("<div>");
				rm.renderControl(item);
				rm.write("</div>");
			});

			rm.write("</div>");
		};

		return CardContainerRenderer;

	}, /* bExport= */ true);
