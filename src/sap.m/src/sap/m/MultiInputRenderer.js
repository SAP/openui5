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
	MultiInputRenderer.apiVersion = 2;

	MultiInputRenderer.prependInnerContent = function (oRm, oControl) {
		oRm.renderControl(oControl._tokenizer);
	};

	MultiInputRenderer.addOuterClasses = function(oRm, oControl) {
		InputRenderer.addOuterClasses.apply(this, arguments);

		oRm.class("sapMMultiInput");

		if (oControl.getTokens().length > 0) {
			oRm.class("sapMMultiInputHasTokens");
		}
	};

	MultiInputRenderer.getAriaDescribedBy = function(oControl) {
		// input method should be overwritten in order to add the tokens information
		var sAriaDescribedBy = InputRenderer.getAriaDescribedBy.apply(this, arguments),
			oInvisibleTextId = oControl.getAggregation("tokenizer") &&
				oControl.getAggregation("tokenizer").getTokensInfoId();

		if (sAriaDescribedBy) {
			sAriaDescribedBy = sAriaDescribedBy + " " + oInvisibleTextId;
		} else {
			sAriaDescribedBy = oInvisibleTextId ;
		}

		return sAriaDescribedBy;
	};

	return MultiInputRenderer;

}, /* bExport= */ true);
