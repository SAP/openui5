/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './ToolbarRenderer'],
	function(Renderer, ToolbarRenderer) {
		"use strict";


		/**
		 * OverflowToolbar renderer.
		 * @namespace
		 */
		var OverflowToolbarRenderer = Renderer.extend(ToolbarRenderer);

		OverflowToolbarRenderer.renderBarContent = function(rm, oToolbar) {

			oToolbar._getVisibleContent().forEach(function(oControl) {
				sap.m.BarInPageEnabler.addChildClassTo(oControl,oToolbar);
				rm.renderControl(oControl);
			});

			if (oToolbar._getOverflowButtonNeeded()) {
				OverflowToolbarRenderer.renderOverflowButton(rm,oToolbar);
			}
		};

		OverflowToolbarRenderer.renderOverflowButton = function(rm,oToolbar) {
			var oOverflowButton = oToolbar._getOverflowButton();
			sap.m.BarInPageEnabler.addChildClassTo(oOverflowButton,oToolbar);
			rm.renderControl(oOverflowButton);
		};

		return OverflowToolbarRenderer;

	}, /* bExport= */ true);
