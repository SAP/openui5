/*
 * ! ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	var ContactDetailsRenderer = {
		apiVersion: 2
	};

	ContactDetailsRenderer.render = function(oRenderManager, oContactDetails) {
		var oContent = oContactDetails.getAggregation("_content");

		oRenderManager.openStart("div", oContactDetails);
		oRenderManager.openEnd();

		oRenderManager.renderControl(oContent);

		oRenderManager.close("div");
	};

	return ContactDetailsRenderer;

});