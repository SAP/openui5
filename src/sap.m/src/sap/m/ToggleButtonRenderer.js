/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.Togglebutton
sap.ui.define(['jquery.sap.global', './ButtonRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ButtonRenderer, Renderer) {
	"use strict";


	/**
	 * @class ToggleButton renderer.
	 * @static
	 */
	
	var ToggleButtonRenderer = Renderer.extend(ButtonRenderer);
	
	/**
	 * Hint: "renderButtonAttributes" is a reserved/hard-coded Button extending function!
	 *       It is used to allow extensions to display content after the actual button content.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager currently rendering this control
	 * @param {sap.m.ToggleButton}
	 *            oToggleButton the ToggleButton that should be rendered
	 * @private
	 */
	ToggleButtonRenderer.renderButtonAttributes = function(rm, oToggleButton) {
		var bPressed = oToggleButton.getPressed();
	
		if (bPressed) {
			rm.addClass("sapMToggleBtnPressed");
		}
	
		rm.writeAttribute('pressed', bPressed);
	};
	

	return ToggleButtonRenderer;

}, /* bExport= */ true);
