/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Renderer',
	'./InputBaseRenderer',
	'sap/ui/Device',
	'sap/ui/core/library',
	"sap/base/security/encodeXML"
],
	function(Renderer, InputBaseRenderer, Device, coreLibrary, encodeXML) {
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

	// Write the opening tag of the TextArea
	TextAreaRenderer.openInputTag = function(oRm, oControl) {
		oRm.write("<textarea");
		oRm.writeAttribute("id", oControl.getId() + "-" + this.getInnerSuffix());
	};

	/**
	 * Ends the opened TextArea tag
	 *
	 * @override
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	TextAreaRenderer.endInputTag = function(oRm, oControl) {
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");
	};

	// Write the closing tag name of the TextArea
	TextAreaRenderer.closeInputTag = function(oRm, oControl) {
		oRm.write("</textarea>");
	};

	TextAreaRenderer.prependInnerContent = function(oRm, oControl) {
		if (oControl.getGrowing()) {
			oRm.write("<div");
			oRm.addClass("sapMTextAreaMirror");
			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + '-hidden');
			oRm.write("></div>");
		}
	};

	// TextArea does not have value property as HTML element, so overwrite base method
	TextAreaRenderer.writeInnerValue = function() {
	};

	// Write the value of the TextArea
	TextAreaRenderer.writeInnerContent = function(oRm, oControl) {
		var sValue = oControl.getValue();
		sValue = encodeXML(sValue);

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