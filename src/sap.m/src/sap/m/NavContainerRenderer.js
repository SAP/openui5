/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";


	/**
	 * NavContainer renderer.
	 * @namespace
	 */
	var NavContainerRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control that should be rendered
	 */
	NavContainerRenderer.render = function(oRm, oControl) {

		oControl._bRenderingInProgress = true;

		// return immediately if control is invisible
		if (!oControl.getVisible()) {
			return;
		}

		oRm.write("<div");
		oRm.writeControlData(oControl);

		oRm.addClass("sapMNav");
		if (oControl.getWidth()) {
			oRm.addStyle("width", oControl.getWidth());
		}
		var sHeight = oControl.getHeight();
		if (sHeight && sHeight != "100%") {
			oRm.addStyle("height", sHeight);
		}

		if (this.renderAttributes) {
			this.renderAttributes(oRm, oControl); // may be used by inheriting renderers, but DO NOT write class or style attributes! Instead, call addClass/addStyle.
		}

		oRm.writeClasses();
		oRm.writeStyles();

		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.write(">"); // div element

		if (this.renderBeforeContent) {
			this.renderBeforeContent(oRm, oControl); // may be used by inheriting renderers
		}

		var oContent = oControl.getCurrentPage();
		if (oContent) {
			oContent.removeStyleClass("sapMNavItemHidden"); // In case the current page was hidden (the previous current page got removed)
			oRm.renderControl(oContent);
		}

		oRm.write("</div>");

		oControl._bRenderingInProgress = false;
	};


	return NavContainerRenderer;

}, /* bExport= */ true);
