/*!
 * ${copyright}
 */

// A renderer for the HTML control
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	var HTMLRenderer = {
	
		/**
		 * Renders either the configured content or a dummy div that will be replaced after rendering
		 */
		render : function(oRM, oControl) {
			// render an invisible, but easily identifiable placeholder for the content
			oRM.write("<div id=\"sap-ui-dummy-" + oControl.getId() + "\" style=\"display:none\">");
	
			// Note: we do not render the content string here, but only in onAfterRendering
			// This has the advantage that syntax errors don't affect the whole control tree
			// but only this control...
	
			oRM.write("</div>");
		}
	
	};

	return HTMLRenderer;

}, /* bExport= */ true);
