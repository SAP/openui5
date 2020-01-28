/*!
 * ${copyright}
 */

sap.ui.define(['./SplitContainerRenderer', 'sap/ui/core/Renderer', 'sap/m/library'],
	function(SplitContainerRenderer, Renderer, library) {
	"use strict";

	// shortcut for sap.m.BackgroundHelper
	var BackgroundHelper = library.BackgroundHelper;

	/**
		 * SplitApp renderer.
		 * @namespace
		 */
	var SplitAppRenderer = {
		apiVersion: 2
	};

	var SplitAppRenderer = Renderer.extend(SplitContainerRenderer);

	SplitAppRenderer.renderAttributes = function(oRm, oControl){
		BackgroundHelper.addBackgroundColorStyles(oRm, oControl.getBackgroundColor(),  oControl.getBackgroundImage());
	};

	SplitAppRenderer.renderBeforeContent = function(oRm, oControl){
		BackgroundHelper.renderBackgroundImageTag(oRm, oControl, "sapMSplitContainerBG",  oControl.getBackgroundImage(), oControl.getBackgroundRepeat(), oControl.getBackgroundOpacity());
	};

	return SplitAppRenderer;

}, /* bExport= */ true);
