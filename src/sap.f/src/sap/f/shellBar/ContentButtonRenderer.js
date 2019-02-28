/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/ButtonRenderer", 'sap/ui/core/Renderer'],
	function(ButtonRenderer, Renderer) {
	"use strict";

	/**
	 * ContentButton renderer.
	 * @namespace
	 */

	var ContentButtonRenderer = Renderer.extend(ButtonRenderer);

		ContentButtonRenderer.writeImgHtml = function(oRm, oControl) {
		var oAvatar = oControl.getAvatar();

		if (oAvatar) {
			oRm.renderControl(oAvatar);
		}
	};

	return ContentButtonRenderer;

}, /* bExport= */ true);
