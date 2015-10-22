/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
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
		oRm.write("<div tabindex=\"0\"");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMTokenizer");
		oRm.writeClasses();
		oRm.write(">"); // div element
	
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
