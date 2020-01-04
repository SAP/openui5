/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Renderer',
	'./InputBaseRenderer',
	'sap/ui/Device',
	'sap/ui/core/library'
],
	function(Renderer, InputBaseRenderer, Device, coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.Wrapping
	var Wrapping = coreLibrary.Wrapping;


	/**
	 * TextArea renderer.
	 * @namespace
	 */
	var TextAreaRenderer = {
		apiVersion: 2
	};
	
	TextAreaRenderer = Renderer.extend(InputBaseRenderer);

	// Adds control specific class
	TextAreaRenderer.addOuterClasses = function(oRm, oControl) {
		oRm.class("sapMTextArea");

		if (oControl.getShowExceededText()) {
			oRm.class("sapMTextAreaWithCounter");
		}
		if (oControl.getHeight()) {
			oRm.class("sapMTextAreaWithHeight");
		}
	};

	// Add extra styles to Container
	TextAreaRenderer.addOuterStyles = function(oRm, oControl) {
		oControl.getHeight() && oRm.style("height", oControl.getHeight());
	};

	// Write the counter of the TextArea.
	TextAreaRenderer.writeDecorations = function(oRm, oControl) {
		var oCounter = oControl.getAggregation("_counter");
		oRm.renderControl(oCounter);
	};

	// Write the opening tag of the TextArea
	TextAreaRenderer.openInputTag = function(oRm, oControl) {
		oRm.openStart("textarea", oControl.getId() + "-" + this.getInnerSuffix());
	};

	/**
	 * Ends the opened TextArea tag
	 *
	 * @override
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	TextAreaRenderer.endInputTag = function(oRm, oControl) {
		oRm.openEnd();
	};

	// Write the closing tag name of the TextArea
	TextAreaRenderer.closeInputTag = function(oRm, oControl) {
		oRm.close("textarea");
	};

	TextAreaRenderer.prependInnerContent = function(oRm, oControl) {
		if (oControl.getGrowing()) {
			oRm.openStart("div", oControl.getId() + '-hidden');
			oRm.class("sapMTextAreaMirror");
			oRm.openEnd().close("div");
		}
	};

	// TextArea does not have value property as HTML element, so overwrite base method
	TextAreaRenderer.writeInnerValue = function() {
	};

	// Write the value of the TextArea
	TextAreaRenderer.writeInnerContent = function(oRm, oControl) {
		var sValue = oControl.getValue();
		oRm.text(sValue);
	};

	// Add extra classes for TextArea element
	TextAreaRenderer.addInnerClasses = function(oRm, oControl) {
		oRm.class("sapMTextAreaInner");
		if (oControl.getGrowing()) {
			oRm.class("sapMTextAreaGrow");
		}
	};

	// role=textbox or aria-multiline should not be explicitly defined
	TextAreaRenderer.getAriaRole = function(oControl) {
		return "";
	};

	// Add extra attributes to TextArea
	TextAreaRenderer.writeInnerAttributes = function(oRm, oControl) {
		if (oControl.getWrapping() != Wrapping.None) {
			oRm.attr("wrap", oControl.getWrapping());
		}

		oRm.attr("rows", oControl.getRows());
		oRm.attr("cols", oControl.getCols());
	};

	return TextAreaRenderer;

}, /* bExport= */ true);
