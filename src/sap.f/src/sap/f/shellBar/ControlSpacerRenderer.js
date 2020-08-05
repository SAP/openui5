/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";

	/**
	 * ControlSpacer renderer.
	 * @namespace
	 */
	var ControlSpacerRenderer = {
		apiVersion: 2
	};

	ControlSpacerRenderer.render = function(rm, oControl) {
		rm.openStart("div", oControl);
		rm.class("sapMTBSpacer");

		rm.style("width", oControl.getWidth());

		rm.openEnd().close("div");
	};

	return ControlSpacerRenderer;

}, /* bExport= */ true);
