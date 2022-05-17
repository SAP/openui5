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
		var SimpleFixFlexRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.SimpleFixFlex} oControl an object representation of the control that should be rendered
		 */
		SimpleFixFlexRenderer.render = function (oRm, oControl) {
			var oFixContent = oControl.getFixContent();

			oRm.openStart('div', oControl);
			oRm.class('sapUiSimpleFixFlex');
			oRm.openEnd();

			if (oFixContent) {
				oFixContent.toggleStyleClass("sapUiSimpleFixFlexFixedWrap", oControl.getFitParent());
				oRm.renderControl(oFixContent.addStyleClass('sapUiSimpleFixFlexFixed'));
			}

			this.renderFlexContentContainer(oRm, oControl);

			oRm.close('div');
		};

		/**
		 * Renders the control in the flex container.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		SimpleFixFlexRenderer.renderFlexContentContainer = function (oRm, oControl) {
			var aFlexContent = oControl.getFlexContent();

			oRm.openStart('div', oControl.getId() + "-flexContentContainer");
			oRm.class('sapUiSimpleFixFlexFlexContentContainer');
			oRm.openEnd();

			if (aFlexContent) {
				oRm.openStart('div');
				oRm.class('sapUiSimpleFixFlexFlexContent');
				oRm.openEnd();

				aFlexContent.forEach(function(oControl) {
					oRm.renderControl(oControl);
				});

				oRm.close('div');
			}

			oRm.close('div');
		};

		return SimpleFixFlexRenderer;
	}, /* bExport= */ true);