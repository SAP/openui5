/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/m/OverflowToolbarRenderer', 'sap/m/BarInPageEnabler'],
	function(Renderer, OverflowToolbarRenderer, BarInPageEnabler) {
		"use strict";


		/**
		 * ToolHeaderRenderer renderer.
		 * @namespace
		 */
		var ToolHeaderRenderer = Renderer.extend(OverflowToolbarRenderer);

		ToolHeaderRenderer.renderBarContent = function(rm, toolbar) {

			var overflowToolbarRendered = false;
			var isUtilitySeparator;

			toolbar._getVisibleContent().forEach(function(control) {

				isUtilitySeparator = control.getMetadata().getName() == 'sap.tnt.ToolHeaderUtilitySeparator';

				if (!overflowToolbarRendered && isUtilitySeparator && toolbar._getOverflowButtonNeeded()) {
					ToolHeaderRenderer.renderOverflowButton(rm, toolbar);
					overflowToolbarRendered = true;
				}

				BarInPageEnabler.addChildClassTo(control, toolbar);
				rm.renderControl(control);
			});

			if (!overflowToolbarRendered && toolbar._getOverflowButtonNeeded()) {
				ToolHeaderRenderer.renderOverflowButton(rm, toolbar);
			}
		};

		return ToolHeaderRenderer;

	}, /* bExport= */ true);
