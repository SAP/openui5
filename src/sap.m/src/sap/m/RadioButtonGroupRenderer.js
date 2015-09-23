/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.RadioButtonGroup
sap.ui.define([],
	function() {
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
	 * @param {sap.m.RadioButtonGroup} oRBGroup an object representation of the control that should be rendered
	 */
	RadioButtonGroupRenderer.render = function(oRenderManager, oRBGroup) {
		// convenience variable
		var rm = oRenderManager;

		// Return immediately if control has no RadioButtons
		if (!oRBGroup.aRBs) {
			return;
		}

		var iColumns = oRBGroup.getColumns();
		var bEnabled = oRBGroup.getEnabled();
		var sControlTextDir = oRBGroup.getTextDirection();
		var bGlobalTextDir = sap.ui.getCore().getConfiguration().getRTL();

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

		// check global rtl config and textDirection property and add "dir" attribute
		if (!bGlobalTextDir && sControlTextDir != sap.ui.core.TextDirection.Inherit) {
			rm.writeAttribute("dir", sControlTextDir.toLowerCase());
		}

		// ARIA
		rm.writeAccessibilityState(oRBGroup, {
			role : "radiogroup"
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
