/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	 * Segmented renderer.
	 * @namespace
	 */
	var SegmentedButtonRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	SegmentedButtonRenderer.render = function(oRM, oControl){
		var aButtons = oControl.getButtons(),
			sSelectedButton = oControl.getSelectedButton(),
			oButton,
			sTooltip,
			sButtonWidth,
			sTooltip,
			i = 0;

		// write the HTML into the render manager
		oRM.write("<ul");
		oRM.addClass("sapMSegB");
		oRM.addClass("sapMSegBHide");
		oRM.writeClasses();
		if (oControl.getWidth() && oControl.getWidth() !== '') {
			oRM.addStyle('width', oControl.getWidth());
		}
		oRM.writeStyles();
		oRM.writeControlData(oControl);
		sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRM.writeAttributeEscaped("title", sTooltip);
		}

		// ARIA
		oRM.writeAccessibilityState(oControl, {
			role : "radiogroup"
		});

		oRM.write(">");

		for (; i < aButtons.length; i++) {
			oButton = aButtons[i];

			// instead of the button API we render a li element but with the id of the button
			// only the button properties enabled, width, icon, text, and tooltip are evaluated here
			oRM.write("<li");
			oRM.writeControlData(oButton);
			oRM.addClass("sapMSegBBtn");
			if (oButton.aCustomStyleClasses !== undefined && oButton.aCustomStyleClasses instanceof Array) {
				for (var j = 0; j < oButton.aCustomStyleClasses.length; j++) {
					oRM.addClass(oButton.aCustomStyleClasses[j]);
				}
			}
			if (oButton.getEnabled()) {
				oRM.addClass("sapMSegBBtnFocusable");
			} else {
				oRM.addClass("sapMSegBBtnDis");
			}
			if (sSelectedButton === oButton.getId()) {
				oRM.addClass("sapMSegBBtnSel");
			}
			if (oButton.getIcon() && oButton.getText() !== '') {
				oRM.addClass("sapMSegBBtnMixed");
			}
			oRM.writeClasses();
			sButtonWidth = oButton.getWidth();
			if (sButtonWidth) {
				oRM.addStyle('width', sButtonWidth);
				oRM.writeStyles();
			}
			sTooltip = oButton.getTooltip_AsString();
			if (sTooltip) {
				oRM.writeAttributeEscaped("title", sTooltip);
			}
			oRM.writeAttribute("tabindex", oButton.getEnabled() ? "0" : "-1");

			// ARIA
			oRM.writeAccessibilityState(oButton, {
				role : "radio",
				checked : sSelectedButton === oButton.getId()
			});

			oRM.write('>');

			// render icon
			if (oButton.getIcon()) {
				var oImage = oButton._getImage((oButton.getId() + "-img"), oButton.getIcon());
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
							}, 20);
						};
						/*eslint-enable no-loop-func*/
					}
				}
				oRM.renderControl(oImage);
			}
			// render text
			if (oButton.getText() !== '') {
				oRM.writeEscaped(oButton.getText(), false);
			}
			oRM.write("</li>");
		}
		oRM.write("</ul>");
	};

	return SegmentedButtonRenderer;

}, /* bExport= */ true);
