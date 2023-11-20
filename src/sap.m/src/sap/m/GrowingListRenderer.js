/*!
 * ${copyright}
 */

sap.ui.define(['./ListRenderer', 'sap/ui/core/Renderer', "sap/base/Log"],
	function(ListRenderer, Renderer, Log) {
	"use strict";



	/**
	 * GrowingList renderer.
	 * @namespace
	 */
	var GrowingListRenderer = Renderer.extend(ListRenderer);
	GrowingListRenderer.apiVersion = 2;

	GrowingListRenderer.render = function(rm, oControl) {
		/**
		 * For backwards compatibility we can't remove GrowingList control
		 * However, if the compatibility version is 1.16 or higher then
		 * we stop rendering to force using List control with growing feature
		 */
		if (oControl._isIncompatible()) {
			Log.warning("Does not render sap.m.GrowingList#" + oControl.getId() + " when compatibility version is 1.16 or higher. Instead use sap.m.List/Table control with growing feature!");
		} else {
			ListRenderer.render.call(this, rm, oControl);
		}
	};


	return GrowingListRenderer;

}, /* bExport= */ true);