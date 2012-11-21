/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.m.DialogRenderer");
jQuery.sap.require("sap.m.BarRenderer");

/**
 * @class Dialog renderer. 
 * @static
 */
sap.m.DialogRenderer = {};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.DialogRenderer.render = function(oRm, oControl) {
	var oCore = sap.ui.getCore(),
		oLeftButton = oCore.byId(oControl.getLeftButton()),
		oRightButton = oCore.byId(oControl.getRightButton());

	// write the HTML into the render manager
	oRm.write("<div");
	oRm.writeControlData(oControl);
	oRm.addClass("sapMDialog");
	oRm.addClass("sapMDialog-CTX");
	if(jQuery.device.is.iphone){
		oRm.addClass("sapMDialogHidden sapMDialogIPhone");
	}
	oRm.writeClasses();
	oRm.write(">");

	if(jQuery.os.ios) {
		oRm.renderControl(oControl._getHeader());
	} else {
		oRm.write("<header>");
		oRm.write("<h1>");
		if(oControl._iconImage){
			oRm.renderControl(oControl._iconImage);
		}
		oRm.write("<span>");
		oRm.renderControl(oControl._headerTitle);
//		oRm.writeEscaped(oControl.getTitle());
		oRm.write("</span>");
		oRm.write("</h1>");
		oRm.write("</header>");
	}

	oRm.write("<section id='" + oControl.getId() + "-cont'>");
	oRm.write("<div id='" + oControl.getId() + "-scroll" +"' class='sapMDialogScroll'>")
	var aContent = oControl.getContent();
	for(var i = 0; i < aContent.length; i++) {
		oRm.renderControl(aContent[i]);
	}
	oRm.write("</div>");
	oRm.write("</section>");
	
	if(!jQuery.os.ios) {
		oRm.write("<footer class='sapMDialogActions'>");

		// Render actions
		if(oLeftButton){
			oRm.write("<div class='sapMDialogAction'>");
			oRm.renderControl(oLeftButton);
			oRm.write("</div>");
		}
		if(oRightButton){
			oRm.write("<div class='sapMDialogAction'>");
			oRm.renderControl(oRightButton);
			oRm.write("</div>");
		}
		
		oRm.write("</footer>");
	}
	oRm.write("</div>");
};