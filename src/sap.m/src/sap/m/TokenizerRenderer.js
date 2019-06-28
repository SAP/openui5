/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/Device', 'sap/ui/core/InvisibleText'],
	function(Device, InvisibleText) {
	"use strict";


	/**
	 * Tokenizer renderer.
	 * @namespace
	 */
	var TokenizerRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TokenizerRenderer.render = function(oRm, oControl){
		//write the HTML into the render manager
		if (oControl.getParent() && (oControl.getParent() instanceof sap.m.MultiInput || oControl.getParent() instanceof sap.m.MultiComboBox)) {
			oRm.openStart("div", oControl);
		} else {
			oRm.openStart("div", oControl).attr("tabindex", "0");
		}

		oRm.class("sapMTokenizer");

		if (!oControl.getEditable()) {
			oRm.class("sapMTokenizerReadonly");
		}

		var aTokens = oControl.getTokens();
		if (!aTokens.length) {
			oRm.class("sapMTokenizerEmpty");
		}

		oRm.style("max-width", oControl.getMaxWidth());
		var sPixelWdth = oControl.getWidth();
		if (sPixelWdth) {
			oRm.style("width", sPixelWdth);
		}

		var oAccAttributes = {
			role: "list",
			readonly: null
		}; // additional accessibility attributes

		//ARIA attributes
		oAccAttributes.labelledby = {
			value: InvisibleText.getStaticId("sap.m", "TOKENIZER_ARIA_LABEL"),
			append: true
		};
		// aria-readonly is not valid for the current role of the tokenizer.

		oRm.accessibilityState(oControl, oAccAttributes);

		oRm.openEnd(); // div element
		oRm.renderControl(oControl.getAggregation("_tokensInfo"));

		oControl._bCopyToClipboardSupport = false;

		if ((Device.system.desktop || Device.system.combi) && aTokens.length) {
			oRm.openStart("div", oControl.getId() + "-clip").class("sapMTokenizerClip");
			if (window.clipboardData) { //IE
				oRm.attr("contenteditable", "true");
				oRm.attr("tabindex", "-1");
			}
			oRm.openEnd();
			oRm.unsafeHtml("&nbsp");
			oRm.close("div");

			oControl._bCopyToClipboardSupport = true;
		}

		oRm.openStart("div");
		oRm.attr("id", oControl.getId() + "-scrollContainer");
		oRm.class("sapMTokenizerScrollContainer");
		oRm.openEnd();

		TokenizerRenderer._renderTokens(oRm, oControl);

		oRm.close("div");
		TokenizerRenderer._renderIndicator(oRm, oControl);
		oRm.close("div");
	};

	/**
	 * renders the tokens
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TokenizerRenderer._renderTokens = function(oRm, oControl){
		var i = 0,
			tokens = oControl.getTokens(),
			length = tokens.length;

		if (oControl.getReverseTokens()) {
			for (i = length - 1; i > -1; i--) {
				oRm.renderControl(tokens[i]);
			}
		} else {
			for (i = 0; i < length; i++) {
				oRm.renderControl(tokens[i]);
			}
		}
	};

	/**
	 * Renders the N-more indicator
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TokenizerRenderer._renderIndicator = function(oRm, oControl){
		oRm.openStart("span");
		oRm.class("sapMTokenizerIndicator");
		oRm.class("sapUiHidden");
		oRm.openEnd().close("span");
	};

	return TokenizerRenderer;

}, /* bExport= */ true);
