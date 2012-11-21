/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.ButtonRenderer");

/**
 * @class Button renderer.
 * @static
 */
sap.m.ButtonRenderer = {};


/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager}
 *            oRenderManager the RenderManager that can be used for writing to
 *            the Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *            oControl an object representation of the control that should be
 *            rendered
 */
sap.m.ButtonRenderer.render = function(rm, oButton) {
	// return immediately if control is invisible
	if (!oButton.getVisible()) {
		return;
	}
	
	// get control properties
	var sType = oButton.getType();
	var sWidth = oButton.getWidth();
	var bEnabled = oButton.getEnabled();
	var bExtraContentDiv = false;
	
	// set control constants
	var sAcceptImage = "check_icon.png";
	var sRejectImage = "delete_icon.png";
	var sUpImage = "back_icon.png";
		
	// start button tag
	rm.write("<button type=\"button\"");
	rm.writeControlData(oButton);

	// button style class
	if (sType != sap.m.ButtonType.Unstyled) {
		rm.addClass("sapMBtn");
	}
	
	// check if button is disabled
	if (!bEnabled) {
		if (sType == sap.m.ButtonType.Back || sType == sap.m.ButtonType.Up) {
			rm.addClass("sapMBtn" + jQuery.sap.escapeHTML(sType) + "Disabled");
		} else {
			if (sType != sap.m.ButtonType.Unstyled) {
				rm.addClass("sapMBtnDisabled");
			}
		}
	} else {
		if (sType != "" && sType != sap.m.ButtonType.Unstyled) {
			rm.addClass("sapMBtn" + jQuery.sap.escapeHTML(sType));
		}	
	}
	
	// only for iOS buttons in bar control: if only an icon and no text is provided the button should be transparent and the active state is a background glow 
	if (oButton.getIcon() && !oButton.getText() && sType != sap.m.ButtonType.Back){
		if (!bEnabled) {
			rm.addClass("sapMBtnIconDisabled");
		} else {
			rm.addClass("sapMBtnIcon");
		}
	}
	
	// set user defined width
	if (sWidth != "" || sWidth.toLowerCase() == "auto") {
		bExtraContentDiv = false;
		rm.writeAttribute("style", "width:" + sWidth + ";");
	}

	// add all classes to button tag
	rm.writeClasses();

	// close start button tag
	rm.write(">");

	// check if additional content-DIV needs to rendered
	if (sType == sap.m.ButtonType.Accept) { 
		bExtraContentDiv = true;
	}
	if (sType == sap.m.ButtonType.Reject) {
		bExtraContentDiv = true;
	}
	if (sType == sap.m.ButtonType.Up) {
		bExtraContentDiv = true;
	}
	if (oButton.getIcon()) {
		bExtraContentDiv = true;
	}
	
	// render button content tag if image control is loaded	
	if (bExtraContentDiv) {
		rm.write("<div");
		if (sType != sap.m.ButtonType.Unstyled) {
			rm.addClass("sapMBtnContent");
			rm.writeClasses();	
		}
		rm.write(">");	
	}

	// get image path
	var imagePath = jQuery.sap.getModulePath("sap.m", '/') + "themes/" + sap.ui.getCore().getConfiguration().getTheme() + "/img/";

	// set image for internal image control (accept)
	this.writeInternalImgHtml(rm, oButton, sType, sap.m.ButtonType.Accept, imagePath, sAcceptImage);	

	// set image for internal image control (reject)
	this.writeInternalImgHtml(rm, oButton, sType, sap.m.ButtonType.Reject, imagePath, sRejectImage);	

	// set image for internal image control (up)
	this.writeInternalImgHtml(rm, oButton, sType, sap.m.ButtonType.Up, imagePath, sUpImage);
	
	// write icon left	
	if (oButton.getIcon() && oButton.getIconFirst()) {
		this.writeImgHtml(rm, oButton);
	}
	
	// write button text	
	this.writeTextHtml(rm, oButton, bExtraContentDiv, sType);

	// write icon right	
	if (oButton.getIcon() && !oButton.getIconFirst()) {
		this.writeImgHtml(rm, oButton);
	}
	
	// close button content tag	
	if (bExtraContentDiv) {
		rm.write("</div>");
	}	
	
	// end button tag
	rm.write("</button>");
};


/**
 * HTML for button text
 */
sap.m.ButtonRenderer.writeTextHtml = function(rm, oButton, bExtraContentDiv, sType) {
	rm.write("<span");
	if (!bExtraContentDiv && sType != sap.m.ButtonType.Unstyled) {
		rm.addClass("sapMBtnContent");
		rm.writeClasses();
	}	
	rm.write(">");
	if (oButton.getText()) {
		rm.writeEscaped(oButton.getText());
	} else {	
		if (sType == sap.m.ButtonType.Back) {
			rm.write("&nbsp;");
		}
	}	
	rm.write("</span>");	
};


/**
 * HTML for image
 */
sap.m.ButtonRenderer.writeImgHtml = function(rm, oButton) {
	rm.renderControl(oButton._getImage((oButton.getId() + "-img"), oButton.getIcon()));	
};


/**
 * HTML for internal image
 */
sap.m.ButtonRenderer.writeInternalImgHtml = function(rm, oButton, sType, sCheckType, sImgPath, sImage) {
	var sHeight = "2.0em";
	var sWidth = "2.0em";
	if (sType === sap.m.ButtonType.Up) {
		sHeight = "2.0em";
		sWidth = "1.0em";
	}
	if (sType === sCheckType) {
		if(!jQuery.os.ios){
			if (oButton._imageBtn) {
				oButton._imageBtn.setSrc(sImgPath + sImage);
				oButton._imageBtn.setHeight(sHeight);
				oButton._imageBtn.setWidth(sWidth);
				rm.renderControl(oButton._imageBtn);
			} else{		
				rm.renderControl(oButton._getImageBtn((oButton.getId() + "-imgBtn"), sImgPath + sImage, sHeight, sWidth));
			}	
		}
	}		
};
