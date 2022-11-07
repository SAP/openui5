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
	var ToolbarRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Toolbar} oControl an object representation of the control that should be rendered.
	 */
	ToolbarRenderer.render = BarInPageEnabler.prototype.render;

	/**
	 * Writes the accessibility state.
	 * To be overwritten by subclasses.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Toolbar} oToolbar An object representation of the control that should be rendered.
	 */
	ToolbarRenderer.writeAccessibilityState = function(oRm, oToolbar) {
		var sRole = oToolbar._getAccessibilityRole(),
			oAccInfo = {
				role: sRole
			};

		if (!oToolbar.getAriaLabelledBy().length && sRole) {
			oAccInfo.labelledby = oToolbar.getTitleId();
		}

		if (oToolbar.getActive()) {
			oAccInfo.haspopup = oToolbar.getAriaHasPopup();
		}

		if (oToolbar._sAriaRoleDescription && sRole) {
			oAccInfo.roledescription = oToolbar._sAriaRoleDescription;
		}

		oRm.accessibilityState(oToolbar, oAccInfo);
	};

	/**
	 * Add classes attributes and styles to the root tag
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Toolbar} oToolbar an object representation of the control that should be rendered
	 */
	ToolbarRenderer.decorateRootElement = function (oRm, oToolbar) {
		this.writeAccessibilityState(oRm, oToolbar);

		oRm.class("sapMTB");
		oRm.class("sapMTBNewFlex");

		if (oToolbar.getActive()) {
			oRm.class("sapMTBActive");
			oRm.attr("tabindex", "0");
		} else {
			oRm.class("sapMTBInactive");
		}

		oRm.class("sapMTB" + oToolbar.getStyle());
		oRm.class("sapMTB-" + oToolbar.getActiveDesign() + "-CTX");

		oRm.style("width", oToolbar.getWidth());
		oRm.style("height", oToolbar.getHeight());
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
