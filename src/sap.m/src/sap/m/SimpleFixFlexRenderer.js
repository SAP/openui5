/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";
		/**
		 * SimpleFixFlex renderer
		 * @namespace
		 */
		var SimpleFixFlexRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		SimpleFixFlexRenderer.render = function (oRm, oControl) {
			var oFixContent = oControl.getFixContent();

			oRm.write('<div');
			oRm.addClass('sapUiSimpleFixFlex');
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write('>');

			if (oFixContent) {
				oRm.renderControl(oFixContent.addStyleClass('sapUiSimpleFixFlexFixed'));
			}

			this.renderFlexContentContainer(oRm, oControl);

			oRm.write('</div>');
		};

		/**
		 * Renders the control in the flex container.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		SimpleFixFlexRenderer.renderFlexContentContainer = function (oRm, oControl) {
			var aFlexContent = oControl.getFlexContent();

			oRm.write('<div');
			oRm.addClass('sapUiSimpleFixFlexFlexContentContainer');
			oRm.writeClasses();
			oRm.write('>');

			if (aFlexContent) {
				oRm.write('<div');
				oRm.addClass('sapUiSimpleFixFlexFlexContent');
				oRm.writeClasses();
				oRm.write('>');

				aFlexContent.forEach(function(oControl) {
					oRm.renderControl(oControl);
				});

				oRm.write('</div>');
			}

			oRm.write('</div>');
		};

		return SimpleFixFlexRenderer;
	}, /* bExport= */ true);