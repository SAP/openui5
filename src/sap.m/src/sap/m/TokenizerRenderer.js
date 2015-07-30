/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/Device'],
	function(jQuery, Device) {
	"use strict";


	/**
	 * Tokenizer renderer. 
	 * @namespace
	 */
	var TokenizerRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TokenizerRenderer.render = function(oRm, oControl){
		//write the HTML into the render manager
		oRm.write("<div tabindex=\"-1\"");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMTokenizer");
		oRm.writeClasses();
		
		oRm.writeAttribute("role", "list");		
		
		var oAccAttributes = {}; // additional accessibility attributes
		
		//ARIA attributes
		oAccAttributes.labelledby = {
			value: oControl._sAriaTokenizerLabelId,
			append: true
		};
		
		oRm.writeAccessibilityState(oControl, oAccAttributes);
		
		oRm.write(">"); // div element

		if (Device.system.desktop || Device.system.combi) {
			oRm.write("<div id='" + oControl.getId() + "-clip' class='sapMTokenizerClip'");
			if (window.clipboardData) { //IE
				oRm.writeAttribute("contenteditable", "true");
				oRm.writeAttribute("tabindex", "-1");
			}
			oRm.write(">&nbsp;</div>");
		}
	
		var sClass = "class=\"sapMTokenizerScrollContainer\">";
		var sSpace = " ";
			
		var sIdScrollContainer = "id=" + oControl.getId() + "-scrollContainer";
		oRm.write("<div" + sSpace + sIdScrollContainer + sSpace + sClass);
		
		TokenizerRenderer._renderTokens(oRm, oControl);
		 
		oRm.write("</div>");
		oRm.write("</div>");
	};
	
	/**
	 * renders the tokens
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TokenizerRenderer._renderTokens = function(oRm, oControl){
		var i, length, tokens;
		tokens = oControl.getTokens();
		length = tokens.length;
		for (i = 0; i < length; i++) {
			oRm.renderControl(tokens[i]);
		}
	};

	return TokenizerRenderer;

}, /* bExport= */ true);
