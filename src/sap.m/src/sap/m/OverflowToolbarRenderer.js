/*!
 * ${copyright}
 */

sap.ui.define(["./library", 'sap/ui/core/Renderer', './ToolbarRenderer', "sap/m/BarInPageEnabler"],
	function(library, Renderer, ToolbarRenderer, BarInPageEnabler) {
		"use strict";

		// shortcut for sap.m.OverflowToolbarPriority
		var OverflowToolbarPriority = library.OverflowToolbarPriority;


		/**
		 * OverflowToolbar renderer.
		 * @namespace
		 */
		var OverflowToolbarRenderer = Renderer.extend(ToolbarRenderer);

		OverflowToolbarRenderer.renderBarContent = function(rm, oToolbar) {

			var bHasAlwaysOverflowContent  = false,
				oLayoutData;

			oToolbar._getVisibleContent().forEach(function(oControl) {
				BarInPageEnabler.addChildClassTo(oControl, oToolbar);

				oLayoutData = oControl.getLayoutData();

				if (!oLayoutData ||
					!oLayoutData.isA('sap.m.OverflowToolbarLayoutData') ||
					oLayoutData.getPriority() !== OverflowToolbarPriority.AlwaysOverflow ) {
						rm.renderControl(oControl);
				} else {
					bHasAlwaysOverflowContent  = true;
				}
			});

			if (bHasAlwaysOverflowContent  || oToolbar._getOverflowButtonNeeded()) {
				OverflowToolbarRenderer.renderOverflowButton(rm, oToolbar);
			}

			OverflowToolbarRenderer.renderOverflowButtonClone(rm, oToolbar);
		};

		OverflowToolbarRenderer.renderOverflowButton = function(rm, oToolbar) {
			var oOverflowButton = oToolbar._getOverflowButton();
			BarInPageEnabler.addChildClassTo(oOverflowButton, oToolbar);
			rm.renderControl(oOverflowButton);
		};

		OverflowToolbarRenderer.renderOverflowButtonClone = function(rm, oToolbar) {
			var oOverflowButtonClone = oToolbar._getOverflowButtonClone();
			BarInPageEnabler.addChildClassTo(oOverflowButtonClone, oToolbar);
			rm.renderControl(oOverflowButtonClone);
		};

		return OverflowToolbarRenderer;

	}, /* bExport= */ true);
