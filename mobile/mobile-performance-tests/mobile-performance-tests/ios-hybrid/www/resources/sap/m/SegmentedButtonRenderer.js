/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.SegmentedButtonRenderer");

/**
 * @class Segmented renderer. 
 * @static
 */
sap.m.SegmentedButtonRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.SegmentedButtonRenderer.render = function(rm, oControl){ 
	// return immediately if control is invisible
	if (!oControl.getVisible()) {
		return;
	}

	var aItems = oControl.getButtons(),
	aItemsLength = aItems.length;
	if(!oControl.getVisible()) {
		return;
	}
	// write the HTML into the render manager
	rm.write("<ul");
	rm.addClass("sapMSegB");
	rm.writeClasses();
	if (oControl.getWidth() && oControl.getWidth() !== '') {
		rm.addStyle('width', oControl.getWidth());
	}
	rm.writeStyles();
	rm.writeControlData(oControl);
	rm.write(">");
	
	for (var i = 0; i < aItemsLength; i++) {
		var oItem = aItems[i];
		
		rm.write("<li");
		rm.writeControlData(oItem);
		rm.addClass("sapMSegBBtn");
		if(oControl.getSelectedButton() === oItem.getId()) {
			rm.addClass("sapMSegBBtnSel");
		}
		if(!oItem.getEnabled()) {
			rm.addClass("sapMSegBBtnDis");
		}
		rm.writeClasses();
		var tooltip = oItem.getTooltip_AsString();
		if (tooltip) {
			rm.writeAttributeEscaped("title", tooltip);
		}
		rm.write('>');
		if(oItem.getIcon() === '' && oItem.getText() !== '') {
			rm.writeEscaped(oItem.getText(), false);
		} else if (oItem.getIcon() !== '' && oItem.getText() === '') {

		var oImage = oItem._getImage((oItem.getId() + "-img"), oItem.getIcon());
		oImage.mProperties.height = "1.5em";
		oImage.mProperties.width = "1.5em";
			rm.renderControl(oImage);	

		} else {
			jQuery.sap.log.error("SEGMENTED: "+oItem.getId()+": Icon and Label is not allowed");
		}
		rm.write("</li>");
	}
	rm.write("</ul>");
	
};
