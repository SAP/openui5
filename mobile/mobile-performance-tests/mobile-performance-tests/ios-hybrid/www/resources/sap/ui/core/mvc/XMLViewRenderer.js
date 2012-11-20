/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides default renderer for XMLView
jQuery.sap.declare("sap.ui.core.mvc.XMLViewRenderer");


sap.ui.core.mvc.XMLViewRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.mvc.XMLView} oControl an object representation of the control that should be rendered
 */
sap.ui.core.mvc.XMLViewRenderer.render = function(rm, oControl) {

	// write the HTML into the render manager
	var $oldContent = oControl._$oldContent = sap.ui.core.RenderManager.findPreservedContent(oControl.getId());
	if ( $oldContent.length === 0 ) {
		// jQuery.sap.log.debug("rendering " + oControl + " anew");
		var bSubView = oControl.isSubView();
		if(!bSubView){
			rm.write("<div");
			rm.writeControlData(oControl);
			rm.addClass("sapUiView");
			rm.addClass("sapUiXMLView");
			rm.writeAttribute("data-sap-ui-preserve", oControl.getId());

			if (oControl.getWidth()) {
				rm.addStyle("width", oControl.getWidth());
			}
			if (oControl.getHeight()) {
				rm.addStyle("height", oControl.getHeight());
			}
			rm.writeStyles();

			rm.writeClasses();

			rm.write(">");
		}
		for (var i = 0; i < oControl._aParsedContent.length; i++) {
			var fragment = oControl._aParsedContent[i];
			if(fragment && typeof(fragment) === "string") {
				rm.write(fragment); // TODO: escaping
			} else {
				rm.renderControl(fragment);
			}
		}
		if (!bSubView) {
			rm.write("</div>");
		}

	} else {

		// jQuery.sap.log.debug("rendering placeholder instead of " + oControl + " (preserved dom)");
		// preserve mode: render only root tag and child controls
		rm.write('<div id="sap-ui-dummy-' + oControl.getId() + '" class="sapUiHidden">');
		for (var i = 0; i < oControl._aParsedContent.length; i++) {
			var fragment = oControl._aParsedContent[i];
			if( typeof(fragment) !== "string") {
				// jQuery.sap.log.debug("replacing preserved DOM for child " + fragment + " with a placeholder");
				jQuery.sap.byId(fragment.getId(), $oldContent).replaceWith('<div id="sap-ui-dummy-' + fragment.getId() + '" class="sapUiHidden"/>');
				rm.renderControl(fragment);
			}
		}
		rm.write('</div>');

	}
};
