/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	var BlockBaseRenderer = {
		apiVersion: 2
	};

	BlockBaseRenderer.render = function (oRm, oControl) {

		if (!oControl.getVisible()) {
			return;
		}

		oRm.openStart("div", oControl);
		if (oControl._getSelectedViewContent()) {
			oRm.class('sapUxAPBlockBase')
				.class("sapUxAPBlockBase" + oControl.getMode());
		} else {
			var sClassShortName = oControl.getMetadata().getName().split(".").pop();

			oRm.class('sapUxAPBlockBaseDefaultSize')
				.class('sapUxAPBlockBaseDefaultSize' + sClassShortName + oControl.getMode());
		}
		oRm.openEnd();

		if (oControl._getSelectedViewContent()) {
			oRm.renderControl(oControl._getSelectedViewContent());
		}
		oRm.close("div");
	};

	return BlockBaseRenderer;

}, /* bExport= */ true);
