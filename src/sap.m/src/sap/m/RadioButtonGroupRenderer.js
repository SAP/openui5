/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.RadioButtonGroup
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * RadioButtonGroup renderer.
	 * @namespace
	 */
	var RadioButtonGroupRenderer = {};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	RadioButtonGroupRenderer.render = function(oRenderManager, oRBGroup) {
		// convenience variable
		var rm = oRenderManager;
	
		var iColumns = oRBGroup.getColumns();
		var bEnabled = oRBGroup.getEnabled();
	
		if (bEnabled) {
			// check if at least one button is enabled
			var aButtons = oRBGroup.getButtons();
			bEnabled = false;
			for (var i = 0; i < aButtons.length; i++) {
				if (aButtons[i].getEnabled()) {
					bEnabled = true;
					break;
				}
			}
		}
	
		rm.write("<div");
		rm.writeControlData(oRBGroup);
		rm.addClass("sapMRbG");
		if (iColumns > 1) {
			if (iColumns == oRBGroup.aRBs.length) {
				rm.addClass("sapMRbG1Row");
			} else {
				rm.addClass("sapMRbGTab");
				if (oRBGroup.getWidth() && oRBGroup.getWidth() != "") {
					rm.addClass("sapMRbGTabFlex");
					// as in Firefox -moz-box-flex > 0 brings ellipsis even if no width is given
					// therefore flexible columns should be only used if a width is given.
				}
			}
		}
	
		if (oRBGroup.getWidth() && oRBGroup.getWidth() != "") {
			rm.addStyle("width", oRBGroup.getWidth());
		}
	
		if (oRBGroup.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oRBGroup.getTooltip_AsString());
		}
	
		if (bEnabled) {
			rm.writeAttribute("tabindex", "0");
		} else {
			rm.writeAttribute("tabindex", "-1");
		}
	
		// ARIA
		rm.writeAccessibilityState(oRBGroup, {
			role : "radiogroup",
			invalid : oRBGroup.getValueState() == sap.ui.core.ValueState.Error,
			disabled : !oRBGroup.getEditable()
		});
	
		rm.writeClasses();
		rm.writeStyles();
		rm.write(">"); // DIV
	
		// columns
		for (var c = 0; c < iColumns; c++) {
			if (iColumns > 1 && iColumns != oRBGroup.aRBs.length) {
				// if only 1 column -> no DIV necessary
				rm.write("<div");
				rm.addClass("sapMRbGCol");
				rm.writeClasses();
				rm.write(">"); // DIV element
			}
			
			// render RadioButtons
			for (var i = c; i < oRBGroup.aRBs.length; i = i + iColumns) {
				rm.renderControl(oRBGroup.aRBs[i]);
			}
	
			if (iColumns > 1 && iColumns != oRBGroup.aRBs.length) {
				rm.write("</div>");
			}
		}
	
		if (iColumns > 1 && iColumns != oRBGroup.aRBs.length) {
			// dummy Column to avoid big spaces between RadioButtons in Safari
			rm.write('<div class="sapMRbGDummy"> </div>');
		}
	
		rm.write("</div>");
	};

	return RadioButtonGroupRenderer;

}, /* bExport= */ true);
