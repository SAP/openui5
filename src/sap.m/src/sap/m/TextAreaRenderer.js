/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './InputBaseRenderer', 'sap/ui/Device', 'sap/ui/core/library'],
	function(jQuery, Renderer, InputBaseRenderer, Device, coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.Wrapping
	var Wrapping = coreLibrary.Wrapping;


	/**
	 * TextArea renderer.
	 * @namespace
	 */
	var TextAreaRenderer = {};


	/**
	 * Input renderer.
	 * @namespace
	 *
	 * TextAreaRenderer extends the TextAreaRenderer
	 */
	var TextAreaRenderer = Renderer.extend(InputBaseRenderer);

	// Adds control specific class
	TextAreaRenderer.addOuterClasses = function(oRm, oControl) {
		oRm.addClass("sapMTextArea");

		if (oControl.getShowExceededText()) {
			oRm.addClass("sapMTextAreaWithCounter");
		}
		if (oControl.getHeight()) {
			oRm.addClass("sapMTextAreaWithHeight");
		}
	};

	// Add extra styles to Container
	TextAreaRenderer.addOuterStyles = function(oRm, oControl) {
		oControl.getHeight() && oRm.addStyle("height", oControl.getHeight());
	};

	// Write the counter of the TextArea.
	TextAreaRenderer.writeDecorations = function(oRm, oControl) {
		var oCounter = oControl.getAggregation("_counter");
		oRm.renderControl(oCounter);
	};


	// Write the opening tag name of the TextArea
	TextAreaRenderer.openInputTag = function(oRm, oControl) {
		oRm.write("<textarea");
	};

	// Write the closing tag name of the TextArea
	TextAreaRenderer.closeInputTag = function(oRm, oControl) {
		oRm.write("</textarea>");
	};

	// TextArea does not have value property as HTML element, so overwrite base method
	TextAreaRenderer.writeInnerValue = function() {
	};

	// Write the value of the TextArea
	TextAreaRenderer.writeInnerContent = function(oRm, oControl) {
		var sValue = oControl.getValue();
		sValue = jQuery.sap.encodeHTML(sValue);

		// Convert the new line HTML entity rather than displaying it as a text.
		//Normalize the /n and /r to /r/n - Carriage Return and Line Feed
		if (Device.browser.msie && Device.browser.version < 11) {
			sValue = sValue.replace(/&#xd;&#xa;|&#xd;|&#xa;/g, "&#13;");
		}
		oRm.write(sValue);
	};

	// Add extra classes for TextArea element
	TextAreaRenderer.addInnerClasses = function(oRm, oControl) {
		oRm.addClass("sapMTextAreaInner");
		if (oControl.getGrowing()) {
			oRm.addClass("sapMTextAreaGrow");
		}
	};

	// role=textbox or aria-multiline should not be explicitly defined
	TextAreaRenderer.getAriaRole = function(oControl) {
		return "";
	};

	// Add extra attributes to TextArea
	TextAreaRenderer.writeInnerAttributes = function(oRm, oControl) {
		if (oControl.getWrapping() != Wrapping.None) {
			oRm.writeAttribute("wrap", oControl.getWrapping());
		}

		oRm.writeAttribute("rows", oControl.getRows());
		oRm.writeAttribute("cols", oControl.getCols());
	};

	return TextAreaRenderer;

}, /* bExport= */ true);
