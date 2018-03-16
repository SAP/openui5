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

	MultiInputRenderer.addOuterClasses = function(oRm, oControl) {
		InputRenderer.addOuterClasses.call(this, oRm, oControl);

		oRm.addClass("sapMMultiInput");

		if (oControl.getEnableMultiLineMode()) {
			oRm.addClass("sapMMultiInputMultiLine");
		}

		if (oControl.getTokens().length > 0) {
			oRm.addClass("sapMMultiInputNoPlaceholder");
		}
	};

	MultiInputRenderer.getAriaDescribedBy = function(oControl) {

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

	MultiInputRenderer.openInputTag = function(oRm, oControl) {

		oRm.write('<div id="' + oControl.getId() + '-border"');
		oRm.addClass('sapMMultiInputBorder');

		if (oControl.getTokens().length > 0) {
			oRm.addClass("sapMMultiInputNarrowBorder");
		}

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
		oRm.write("<div class=\"sapMMultiInputInputContainer\">");

		if ( oControl._isMultiLineMode && oControl._bShowIndicator === true) {
			var iTokens = oControl.getTokens().length;
			oRm.write("<span class=\"sapMMultiInputIndicator\">");
			if (iTokens > 1) {
				var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
				oRm.write( oMessageBundle.getText("MULTIINPUT_SHOW_MORE_TOKENS", iTokens - 1) );
			}
			oRm.write("</span>");
		}

		InputRenderer.openInputTag.call(this, oRm, oControl);
	};

	/**
	 * Write the decorations of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	MultiInputRenderer.writeDecorations = function(oRm, oControl) {

	};


	MultiInputRenderer.closeInputTag = function(oRm, oControl) {
		InputRenderer.closeInputTag.call(this, oRm, oControl);

		oRm.write("</div>");

		InputRenderer.writeValueHelpIcon(oRm, oControl);

		oRm.write("</div>");
		oRm.write("<div class=\"sapMMultiInputShadowDiv\"></div>");
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
