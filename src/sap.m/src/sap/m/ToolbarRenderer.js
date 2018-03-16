/*!
 * ${copyright}
 */

sap.ui.define(['./BarInPageEnabler'],
	function(BarInPageEnabler) {
	"use strict";


	/**
	 * Toolbar renderer.
	 * @namespace
	 */
	var ToolbarRenderer = {};

	// determines whether toolbar has new flexbox (shrink) support
	ToolbarRenderer.hasNewFlexBoxSupport = (function() {
		var oStyle = document.documentElement.style;
		return (oStyle.flex !== undefined || oStyle.webkitFlexShrink !== undefined);
	}());

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered.
	 */
	ToolbarRenderer.render = BarInPageEnabler.prototype.render;

	/**
	 * Add classes attributes and styles to the root tag
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oToolbar an object representation of the control that should be rendered
	 */
	ToolbarRenderer.decorateRootElement = function (oRm, oToolbar) {
		oRm.addClass("sapMTB");

		// ARIA
		oRm.writeAccessibilityState(oToolbar, {
			role: oToolbar._getAccessibilityRole()
		});


		if (!ToolbarRenderer.hasNewFlexBoxSupport) {
			oRm.addClass("sapMTBOldFlex");
		} else {
			oRm.addClass("sapMTBNewFlex");
		}

		if (oToolbar.getActive()) {
			oRm.addClass("sapMTBActive");
			oRm.writeAttribute("tabindex", "0");
		} else {
			oRm.addClass("sapMTBInactive");
		}

		oRm.addClass("sapMTB" + oToolbar.getStyle());
		oRm.addClass("sapMTB-" + oToolbar.getActiveDesign() + "-CTX");

		var sWidth = oToolbar.getWidth();
		var sHeight = oToolbar.getHeight();
		sWidth && oRm.addStyle("width", sWidth);
		sHeight && oRm.addStyle("height", sHeight);
	};

	ToolbarRenderer.renderBarContent = function(rm, oToolbar) {
		oToolbar.getContent().forEach(function(oControl) {
			BarInPageEnabler.addChildClassTo(oControl, oToolbar);
			rm.renderControl(oControl);
		});
	};

	/**
	 * Determines, if the IBarContext classes should be added to the control
	 * @private
	 */
	ToolbarRenderer.shouldAddIBarContext = function (oControl) {
		return false;
	};



	return ToolbarRenderer;

}, /* bExport= */ true);
