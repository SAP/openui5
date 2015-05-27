/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './InputBaseRenderer', 'sap/ui/core/Renderer', 'sap/ui/core/ValueStateSupport'],
	function(jQuery, InputBaseRenderer, Renderer, ValueStateSupport) {
	"use strict";


	/**
	 * MultiComboBox renderer.
	 * @namespace
	 */
	var MultiComboBoxRenderer = Renderer.extend(sap.m.ComboBoxBaseRenderer);
	
	/**
	 * CSS class to be applied to the HTML root element of the MultiComboBox control.
	 * 
	 * @type {string}
	 */
	MultiComboBoxRenderer.CSS_CLASS = "sapMMultiComboBox";
	
	/**
	 * CSS class to be applied to the HTML root element of the MultiComboBox control.
	 * 
	 * @type {string}
	 */
	MultiComboBoxRenderer.DOT_CSS_CLASS = ".sapMMultiComboBox";
	
	/**
	 * Add classes to the MultiComboBox.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *          oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control}
	 *          oControl An object representation of the control that should be rendered.
	 */
	MultiComboBoxRenderer.addOuterClasses = function(oRm, oControl) {
		sap.m.ComboBoxBaseRenderer.addOuterClasses.apply(this, arguments);
		oRm.addClass(MultiComboBoxRenderer.CSS_CLASS);
		if (oControl._hasTokens()) {
			oRm.addClass("sapMMultiComboBoxHasToken");
		}
	};
	
	/**
	 * Add inner classes to the MultiMultiComboBox's input element.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *          oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control}
	 *          oControl An object representation of the control that should be rendered.
	 */
	MultiComboBoxRenderer.addInnerClasses = function(oRm, oControl) {
		sap.m.ComboBoxBaseRenderer.addInnerClasses.apply(this, arguments);
		oRm.addClass(MultiComboBoxRenderer.CSS_CLASS + "InputInner");
	};
	
	MultiComboBoxRenderer.openInputTag = function(oRm, oControl) {
		oRm.write('<div class="sapMMultiComboBoxBorder"');
		oRm.writeAttribute("id", oControl.getId() + "-border");  // UI5 core expect a DIV with ID	
		oRm.write(">");
		
		oRm.renderControl(oControl._oTokenizer);
		
		oRm.write("<div class=\"sapMMultiComboBoxInputContainer\">");
		InputBaseRenderer.openInputTag.call(this, oRm, oControl);
	};
	
	MultiComboBoxRenderer.closeInputTag = function(oRm, oControl) {
		InputBaseRenderer.closeInputTag.call(this, oRm, oControl);
		oRm.write("</div>");
		oRm.write("</div>");
		oRm.write("<div class=\"sapMMultiComboBoxShadowDiv\"/>");
	};
	

	return MultiComboBoxRenderer;

}, /* bExport= */ true);
