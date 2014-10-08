/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class Segmented renderer. 
	 * @static
	 */
	var SegmentedButtonRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	SegmentedButtonRenderer.render = function(rm, oControl){
		var aButtons = oControl.getButtons(),
			sSelectedButton = oControl.getSelectedButton(),
			oItem,
			sTooltip,
			sButtonWidth,
			i = 0;
	
		
		// return immediately if control is invisible
		if (!oControl.getVisible()) {
			return;
		}
	
	
		// write the HTML into the render manager
		rm.write("<ul");
		rm.addClass("sapMSegB");
		rm.addClass("sapMSegBHide");
	
		rm.writeClasses();
		if (oControl.getWidth() && oControl.getWidth() !== '') {
			rm.addStyle('width', oControl.getWidth());
		}
		rm.writeStyles();
		rm.writeControlData(oControl);
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
		rm.write(">");
	
		for (; i < aButtons.length; i++) {
			oItem = aButtons[i];
	
			// instead of the button API we render a li element but with the id of the button
			rm.write("<li");
			rm.writeControlData(oItem);
			rm.addClass("sapMSegBBtn");
			if (sSelectedButton === oItem.getId()) {
				rm.addClass("sapMSegBBtnSel");
			}
			if (!oItem.getEnabled()) {
				rm.addClass("sapMSegBBtnDis");
			}
			
			if (oItem.getEnabled()) {
				rm.addClass("sapMSegBBtnFocusable");
			}
			
			sTooltip = oItem.getTooltip_AsString();
			if (sTooltip) {
				rm.writeAttributeEscaped("title", sTooltip);
			}
			rm.writeAttribute("tabindex", oItem.getEnabled() ? "0" : "-1");
			rm.writeClasses();
			var sButtonWidth = oItem.getWidth();
			if (sButtonWidth) {
				rm.addStyle('width', sButtonWidth);
				rm.writeStyles();
			}
			rm.write('>');
			if (oItem.getIcon() === '' && oItem.getText() !== '') {
				rm.writeEscaped(oItem.getText(), false);
			} else if (oItem.getIcon() !== '' && oItem.getText() === '') {
				var oImage = oItem._getImage((oItem.getId() + "-img"), oItem.getIcon());
				if (oImage instanceof sap.m.Image) {
					// image does not have an onload event but we need to recalculate the button sizes after the image is loaded
					// we override the onload method once and call the calulation method after the original method is called
					if (oImage.onload === sap.m.Image.prototype.onload) {
						/*eslint-disable no-loop-func*/
						oImage.onload = function () {
							if (sap.m.Image.prototype.onload) {
								sap.m.Image.prototype.onload.apply(this, arguments);
							}
							window.setTimeout(function() {
								oControl._fCalcBtnWidth();
							},20);
						};
						/*eslint-enable no-loop-func*/
					}
				}
				rm.renderControl(oImage);
	
			} else if (oItem.getIcon() !== '' && oItem.getText() !== '' ) {
				jQuery.sap.log.error("SEGMENTED: " + oItem.getId() + ": Icon and Label is not allowed");
			}
			rm.write("</li>");
		}
		rm.write("</ul>");
	};
	

	return SegmentedButtonRenderer;

}, /* bExport= */ true);
