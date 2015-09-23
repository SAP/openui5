/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.demokit.CodeViewer
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class CodeViewer renderer. 
	 * @static
	 */
	var CodeViewerRenderer = function() {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	CodeViewerRenderer.render = function(oRM, oControl){
		
		if ( !oControl.getVisible() ) {
			return;
		}
		
		// write the HTML into the render manager  
		oRM.write("<pre");
		oRM.writeControlData(oControl);
		if ( oControl.getEditable() ) {
			oRM.addClass("sapUiCodeViewer");
			oRM.addClass("editable");
			oRM.writeAttribute("contentEditable", "true");
		} else {
			oRM.addClass("prettyprint"); // this class acts as a 'TODO' for the pretty printer!
		}
		if (oControl.getLineNumbering()) {
			oRM.addClass("linenums");
		}
			
		var sHeight = oControl.getHeight();
		if (sHeight) {
			oRM.addStyle("height", sHeight);
		}
		var sWidth = oControl.getWidth();
		if (sWidth) {
			oRM.addStyle("width", sWidth);
		}
		oRM.writeClasses();
		oRM.writeStyles();
		oRM.write(">");
		if ( oControl.getSource() ) {
			oRM.write(jQuery.sap.encodeHTML(oControl.getSource()));
		}
		oRM.write("</pre>");
	};
	

	return CodeViewerRenderer;

}, /* bExport= */ true);
