/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './InputRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, InputRenderer, Renderer) {
	"use strict";


	/**
	 * MultiInput renderer.
	 * @namespace
	 */
	var MultiInputRenderer = Renderer.extend(InputRenderer);

	MultiInputRenderer.addOuterClasses = function(oRm, oControl) {
		InputRenderer.addOuterClasses.call(this, oRm, oControl);

		oRm.addClass("sapMMultiInput");

		if (oControl.getEnableMultiLineMode()) {
			oRm.addClass("sapMMultiInputMultiLine");
		}
	};

	MultiInputRenderer.getAriaDescribedBy = function(oControl) {

		var sAriaDescribedBy = InputRenderer.getAriaDescribedBy.apply(this, arguments);

		if (sAriaDescribedBy) {
			sAriaDescribedBy = sAriaDescribedBy + " " + oControl._sAriaMultiInputContainTokenId;
		} else {
			sAriaDescribedBy = oControl._sAriaMultiInputContainTokenId;
		}

		return sAriaDescribedBy;
	};


	MultiInputRenderer.openInputTag = function(oRm, oControl) {

		oRm.write('<div id="' + oControl.getId() + '-border"');
		oRm.addClass('sapMMultiInputBorder');

		if (oControl.getEnableMultiLineMode() || oControl._bUseDialog ) {

			oControl._isMultiLineMode = true;

			if (oControl.getEditable()) {
				oControl._showIndicator();
			} else {
				oControl._showAllTokens();
			}
		}

		oRm.writeClasses();
		oRm.write('>');

		MultiInputRenderer._renderTokens(oRm, oControl);
		MultiInputRenderer._renderInput(oRm, oControl);
	};

	MultiInputRenderer._renderTokens = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("tokenizer"));
	};

	MultiInputRenderer._renderInput = function(oRm, oControl) {
		var oTokenizer = oControl.getAggregation("tokenizer"),
			aTokens = (oTokenizer && oTokenizer.getTokens) ? oTokenizer.getTokens() : [];

		if ( oControl._isMultiLineMode && oControl._bShowIndicator === false && aTokens.length) {
			oRm.write("<div class=\"sapMMultiInputInputContainer sapMMultiInputMultiModeInputContainer\">");
		} else {
			if ( oControl._isMultiLineMode && oControl._bShowIndicator === true) {
				var iTokens = oControl.getTokens().length;
				oRm.write("<span class=\"sapMMultiInputIndicator\">");
				if (iTokens > 1) {
					var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
					oRm.write( oMessageBundle.getText("MULTIINPUT_SHOW_MORE_TOKENS", iTokens - 1) );
				}
				oRm.write("</span>");
			}
			oRm.write("<div class=\"sapMMultiInputInputContainer\">");
		}

		InputRenderer.openInputTag.call(this, oRm, oControl);

	};


	MultiInputRenderer.closeInputTag = function(oRm, oControl) {
		InputRenderer.closeInputTag.call(this, oRm, oControl);

		oRm.write("</div>");
		oRm.write("</div>");
		oRm.write("<div class=\"sapMMultiInputShadowDiv\"/>");
	};

	MultiInputRenderer.addInnerStyles = function(oRm, oControl) {
		if (oControl._isMultiLineMode && oControl._bShowIndicator === true && oControl.getTokens().length > 1) {
			oRm.addStyle("opacity", 0);
		}
	};

	MultiInputRenderer.addControlWidth = function(oRm, oControl) {
		if (!oControl.getWidth() || oControl.getWidth() === "auto") {
			oRm.addStyle("width", "100%");
		} else {
			InputRenderer.addControlWidth.call(this, oRm, oControl);
		}
	};


	return MultiInputRenderer;

}, /* bExport= */ true);
