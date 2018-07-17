/*!
 * ${copyright}
 */
sap.ui.define(['./InputRenderer', 'sap/ui/core/Renderer'],
	function(InputRenderer, Renderer) {
	"use strict";


	/**
	 * MultiInput renderer.
	 * @namespace
	 */
	var MultiInputRenderer = Renderer.extend(InputRenderer);

	MultiInputRenderer.prependInnerContent = function (oRm, oControl) {
		oRm.renderControl(oControl._tokenizer);
	};

	MultiInputRenderer.addOuterClasses = function(oRm, oControl) {
		oRm.addClass("sapMMultiInput");

		if (oControl.getTokens().length > 0) {
			oRm.addClass("sapMMultiInputHasTokens");
		}
	};

	return MultiInputRenderer;

}, /* bExport= */ true);
