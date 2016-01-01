/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './SplitContainerRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, SplitContainerRenderer, Renderer) {
	"use strict";

/**
	 * SplitApp renderer.
	 * @namespace
	 */
	var SplitAppRenderer = {
	};

	var SplitAppRenderer = Renderer.extend(SplitContainerRenderer);

	SplitAppRenderer.renderAttributes = function(oRm, oControl){
		sap.m.BackgroundHelper.addBackgroundColorStyles(oRm, oControl.getBackgroundColor(),  oControl.getBackgroundImage());
	};

	SplitAppRenderer.renderBeforeContent = function(oRm, oControl){
		sap.m.BackgroundHelper.renderBackgroundImageTag(oRm, oControl, "sapMSplitContainerBG",  oControl.getBackgroundImage(), oControl.getBackgroundRepeat(), oControl.getBackgroundOpacity());
	};

	return SplitAppRenderer;

}, /* bExport= */ true);
