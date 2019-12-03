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
		apiVersion: 2
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

		var sHeight = oControl.getHeight(),
			sTooltip = oControl.getTooltip_AsString(),
			oContent = oControl.getCurrentPage();


		oRm.openStart("div", oControl);

		oRm.class("sapMNav");

		oRm.style("width", oControl.getWidth());

		if (sHeight && sHeight != "100%") {
			oRm.style("height", sHeight);
		}

		if (this.renderAttributes) {
			this.renderAttributes(oRm, oControl); // may be used by inheriting renderers, but DO NOT write class or style attributes! Instead, call addClass/addStyle.
		}

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.openEnd(); // div element

		if (this.renderBeforeContent) {
			this.renderBeforeContent(oRm, oControl); // may be used by inheriting renderers
		}

		oControl.getPages().forEach(function(oPage) {
			if (oPage === oContent) {
				oContent.removeStyleClass("sapMNavItemHidden"); // In case the current page was hidden (the previous current page got removed)
				oRm.renderControl(oContent);
			} else {
				oRm.cleanupControlWithoutRendering(oPage);
			}
		});

		oRm.close("div");

		oControl._bRenderingInProgress = false;
	};


	return NavContainerRenderer;

}, /* bExport= */ true);
