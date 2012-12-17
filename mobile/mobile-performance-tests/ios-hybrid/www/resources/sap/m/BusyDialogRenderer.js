/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.BusyDialogRenderer");

/**
 * @class BusyDialog renderer. 
 * @static
 */
sap.m.BusyDialogRenderer = {
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.BusyDialogRenderer.render = function(oRm, oControl){ 
	// write the HTML into the render manager
	oRm.write("<div");
	oRm.writeControlData(oControl);
	oRm.addClass("sapMBusyDialog sapMCommonDialog");
	if(jQuery.device.is.iphone){
		oRm.addClass("sapMDialogHidden");
	}
	oRm.writeClasses();
	oRm.write(">");
	if(!oControl._busyIndicator)
	oControl._busyIndicator = new sap.m.BusyIndicator(oControl.getId() + 'busyInd', {customIcon: oControl.getCustomIcon(), customIconWidth: '44' + 'px', customIconheight: '44' +'px', 
													customIconRotationSpeed: oControl.getCustomIconRotationSpeed(), customIconDensityAware: oControl.getCustomIconDensityAware()}).addStyleClass('sapMBsyInd');
	
	if(oControl.getTitle()) {
		oRm.write("<h1 class=\"sapMDialogTitle\">" + oControl.getTitle() + "</h1>");
	}
	
	if(jQuery.os.ios) {
		oRm.renderControl(oControl.oLabel);
		oRm.renderControl(oControl._busyIndicator);
	} else {
		oRm.renderControl(oControl._busyIndicator);
		oRm.renderControl(oControl.oLabel);
	}
	
	if(oControl.getShowCancelButton()){
		oRm.write("<div class='sapMBusyDialogAction'>");
		if(!oControl._oButton) {
			var sButtonText = (oControl.getCancelButtonText()) ? oControl.getCancelButtonText() : 	sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("BUSYDIALOG_CANCELBUTTON_TEXT");
			;
			var sButtonStyle = (jQuery.os.ios) ? sap.m.ButtonType.Unstyled : sap.m.ButtonType.Default;
			oControl._oButton = new sap.m.Button(oControl.getId() + 'busyCancelBtn', {
				text: sButtonText,
				type: sButtonStyle,
				tap : function() {
					oControl.close();
				}
			}).addStyleClass("sapMDialogBtn");
		}
		oRm.renderControl(oControl._oButton);
		oRm.write("</div>");
	}
	oRm.write("</div>");
};
