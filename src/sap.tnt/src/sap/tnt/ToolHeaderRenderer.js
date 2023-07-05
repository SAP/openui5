/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Renderer",
	"sap/m/OverflowToolbarRenderer",
	"sap/m/BarInPageEnabler"
], function (library,
			 Renderer,
			 OverflowToolbarRenderer,
			 BarInPageEnabler) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;

	/**
	 * ToolHeaderRenderer renderer.
	 * @namespace
	 */
	var ToolHeaderRenderer = Renderer.extend(OverflowToolbarRenderer);

	ToolHeaderRenderer.apiVersion = 2;

	ToolHeaderRenderer.renderBarContent = function (oRM, oToolbar) {
		var bOverflowButtonRendered = false,
			bIsUtilitySeparator;

		if (oToolbar.getActive()) {
			oRM.renderControl(oToolbar._getActiveButton());
		}

		oToolbar._getVisibleContent().forEach(function(oControl) {
			BarInPageEnabler.addChildClassTo(oControl, oToolbar);

			bIsUtilitySeparator = oControl.isA("sap.tnt.ToolHeaderUtilitySeparator");

			if (bIsUtilitySeparator && !bOverflowButtonRendered) {
				this._renderOverflowButton(oRM, oToolbar);
				bOverflowButtonRendered = true;
			}

			if (oToolbar._getControlPriority(oControl) !== OverflowToolbarPriority.AlwaysOverflow) {
				oRM.renderControl(oControl);
			}
		}.bind(this));

		if (bOverflowButtonRendered) {
			return;
		}

		this._renderOverflowButton(oRM, oToolbar);
	};

	ToolHeaderRenderer._renderOverflowButton = function (oRM, oToolbar) {
		var bHasAlwaysOverflowVisibleContent  = oToolbar.getContent().some(function (oControl) {
				return oControl.getVisible() && oToolbar._getControlPriority(oControl) === OverflowToolbarPriority.AlwaysOverflow;
			}),
			bHasAnyVisibleContent = oToolbar.getContent().some(function (oControl) {
				return oControl.getVisible();
			});

		if (bHasAlwaysOverflowVisibleContent || oToolbar._getOverflowButtonNeeded()) {
			OverflowToolbarRenderer.renderOverflowButton(oRM, oToolbar);
		}

		if (bHasAnyVisibleContent) {
			OverflowToolbarRenderer.renderOverflowButtonClone(oRM, oToolbar);
		}
	};

	return ToolHeaderRenderer;
}, /* bExport= */ true);