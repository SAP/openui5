/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.m.BusyIndicatorRenderer");

/**
 * @class BusyIndicator renderer. 
 * @static
 */
sap.m.BusyIndicatorRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.BusyIndicatorRenderer.render = function(oRm, oControl){ 
	// return immediately if control is invisible
	if(!oControl.getVisible()) {
		return;
	}

	// write the HTML into the render manager
	var iSpinBar = (jQuery.os.ios) ? 13 :4;
	oRm.write("<div");
	oRm.writeControlData(oControl);
	oRm.writeAttribute("class","sapMBusyIndicator"); 
	oRm.write(">");
	if(oControl.getCustomIcon()){
		if(!oControl._iconImage) {
			var sWidth = oControl.getCustomIconWidth() || '44px';
			var sHeight = oControl.getCustomIconHeight() || '44px';
			oControl._iconImage = new sap.m.Image(oControl.getId() + "-icon", {src: oControl.getCustomIcon(), width: sWidth, height: sHeight, densityAware: oControl.getCustomIconDensityAware()}).addStyleClass('sapMBsyIndIcon');
		}
		oRm.renderControl(oControl._iconImage);
	}else {
		oRm.write("<div");
		oRm.writeAttribute("class","sapMSpinner"); 
		oRm.addStyle('width', oControl.getSize());
		oRm.addStyle('height', oControl.getSize());
		oRm.writeStyles();
		oRm.write(">");

		for (var i=1; i<iSpinBar; i++) {
			var sBarClass = 'sapMSpinBar' + i;
			if(!jQuery.os.ios) {
				if(i === 3) {
					var sBarClass1 = 'sapMSpinBar' + 4;
					oRm.write('<div class="'+ sBarClass + '"><div class="'+ sBarClass1 + '"></div></div>');
					break;
				}
			}
			oRm.write('<div class="'+ sBarClass + '"></div>');
		}
		oRm.write("</div>");
	}
	if (oControl.getText()) {
		if (!oControl._oLabel) {
			oControl._oLabel = new sap.m.Label(oControl.getId() + "-label", {text: oControl.getText()}).addStyleClass("sapMBsyIndLabel");
			if (oControl.getTextDirection()){
				oControl._oLabel.setTextDirection(oControl.getTextDirection());
			}
		}
		oRm.renderControl(oControl._oLabel);
	}
	
	oRm.write("</div>");
};
