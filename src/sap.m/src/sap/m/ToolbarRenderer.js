/*!
 * ${copyright}
 */

sap.ui.define(['./BarInPageEnabler'], function(BarInPageEnabler) {
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
 * Writes the accessibility state of the given toolbar using the given renderer manager.
 * To be overwritten by subclasses.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm - The renderer manager to use for writing the accessibility state.
 * @param {sap.m.Toolbar} oToolbar - The toolbar to write the accessibility state for.
 * @returns {void}
 *
 * @description
 * This function uses the `assignAccessibilityState` method of the toolbar to obtain a map of ARIA properties to set on
 * the rendered toolbar element. If the map is empty, the accessibility state is set to `null` to ensure that no
 * unnecessary ARIA attributes are present. Otherwise, the accessibility state is set to the toolbar.
 * The purpose of this logic is to ensure that the rendered toolbar has appropriate ARIA attributes for accessibility
 * purposes, while avoiding unnecessary attributes that could be confusing or misleading to users of assistive technology.
 */
ToolbarRenderer.writeAccessibilityState = function(oRm, oToolbar) {
	var oAccInfo = {},
		mAriaProps = oToolbar.assignAccessibilityState(oAccInfo);

	if (!Object.keys(mAriaProps).length) {
		oRm.accessibilityState(null);
	} else {
		oRm.accessibilityState(oToolbar, mAriaProps);
	}
};

/**
 * Add classes attributes and styles to the root tag
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.m.Toolbar} oToolbar an object representation of the control that should be rendered
 */
ToolbarRenderer.decorateRootElement = function (oRm, oToolbar) {
	var bToolbarActive = oToolbar.getActive();
	if (bToolbarActive) {
		oRm.class("sapMTBActive");
	} else {
		this.writeAccessibilityState(oRm, oToolbar);
		oRm.class("sapMTBInactive");
	}

	oRm.class("sapMTB");
	oRm.class("sapMTBNewFlex");

	oRm.class("sapMTB" + oToolbar.getStyle());
	oRm.class("sapMTB-" + oToolbar.getActiveDesign() + "-CTX");

	oRm.style("width", oToolbar.getWidth());
	oRm.style("height", oToolbar.getHeight());
};

ToolbarRenderer.renderBarContent = function (rm, oToolbar) {
	var oFirstVisibleControl = null;

	if (oToolbar.getActive()) {
		rm.renderControl(oToolbar._getActiveButton());
	}
	oToolbar.getContent().forEach(function (oControl) {
		if (oControl.isA("sap.ui.core.HTML")) {
			rm.renderControl(oControl);
		} else {
			BarInPageEnabler.addChildClassTo(oControl, oToolbar);
			if (!oFirstVisibleControl && oControl.getVisible()) {
				oControl.addStyleClass("sapMBarChildFirstChild");
				oFirstVisibleControl = oControl;
			} else {
				oControl.removeStyleClass("sapMBarChildFirstChild");
			}
			rm.renderControl(oControl);
		}
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

});
