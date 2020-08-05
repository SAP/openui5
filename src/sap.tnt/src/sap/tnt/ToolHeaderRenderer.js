/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/m/OverflowToolbarRenderer",
	"sap/m/BarInPageEnabler"
], function (Renderer, OverflowToolbarRenderer, BarInPageEnabler) {
	"use strict";

	/**
	 * ToolHeaderRenderer renderer.
	 * @namespace
	 */
	var ToolHeaderRenderer = Renderer.extend(OverflowToolbarRenderer);

	ToolHeaderRenderer.apiVersion = 2;

	ToolHeaderRenderer.renderBarContent = function (oRM, oToolbar) {
		var bOverflowToolbarRendered = false,
			bIsUtilitySeparator;

		oToolbar._getVisibleContent().forEach(function (oControl) {

			bIsUtilitySeparator = oControl.isA("sap.tnt.ToolHeaderUtilitySeparator");

			if (!bOverflowToolbarRendered && bIsUtilitySeparator && oToolbar._getOverflowButtonNeeded()) {
				ToolHeaderRenderer.renderOverflowButton(oRM, oToolbar);
				bOverflowToolbarRendered = true;
			}

			BarInPageEnabler.addChildClassTo(oControl, oToolbar);
			oRM.renderControl(oControl);
		});

		if (!bOverflowToolbarRendered && oToolbar._getOverflowButtonNeeded()) {
			ToolHeaderRenderer.renderOverflowButton(oRM, oToolbar);
		}
	};

	return ToolHeaderRenderer;
}, /* bExport= */ true);