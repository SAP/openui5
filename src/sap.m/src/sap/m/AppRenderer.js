/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './NavContainerRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, NavContainerRenderer, Renderer) {
	"use strict";


	/**
	 * App renderer. 
	 * @namespace
	 */
	var AppRenderer = {
	};
	
	var AppRenderer = Renderer.extend(NavContainerRenderer);
	
	AppRenderer.renderAttributes = function(rm, oControl) {
		sap.m.BackgroundHelper.addBackgroundColorStyles(rm, oControl.getBackgroundColor(),  oControl.getBackgroundImage());
	};
	
	AppRenderer.renderBeforeContent = function(rm, oControl) {
		sap.m.BackgroundHelper.renderBackgroundImageTag(rm, oControl, "sapMAppBG",  oControl.getBackgroundImage(), oControl.getBackgroundRepeat(), oControl.getBackgroundOpacity());
	};
	

	return AppRenderer;

}, /* bExport= */ true);
