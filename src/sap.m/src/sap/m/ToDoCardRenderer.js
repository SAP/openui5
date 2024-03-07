/*!
 * ${copyright}
 */

sap.ui.define(["./library","sap/base/security/encodeCSS"], function() {
"use strict";

/**
 * ToDo Card renderer.
 * @namespace
 */
var ToDoCardRenderer = {
	apiVersion: 2    // enable in-place DOM patching
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.m.ActionTile} oControl the control to be rendered
 */
ToDoCardRenderer.render = function(oRm, oControl) {
oRm.openStart("div",oControl);
oRm.class("sapMATStateLoading");
oRm.attr("tabindex", "0");

oRm.openEnd();
this._renderLoadingShimmers(oRm,oControl);
this._renderFocusDiv(oRm, oControl);
oRm.close("div");
};
/**
 * Renders the focus div for the ActionTile.
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.ActionTile} oControl The control that is rendered
 * @private
 */

ToDoCardRenderer._renderFocusDiv = function(oRm, oControl) {
	oRm.openStart("div", oControl.getId() + "-focus");
	oRm.class("sapMATFocusDiv");
	oRm.openEnd();
	oRm.close("div");
};
/**
 * Renders the loading state shimmers on the ActionTile
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.ActionTile} oControl The control that is rendered
 * @private
 */
ToDoCardRenderer._renderLoadingShimmers = function(oRm, oControl) {
	oRm.openStart("div").class("sapMGTContentShimmerPlaceholderItem");
	oRm.class("sapMGTContentShimmerPlaceholderWithDescription");
	oRm.openEnd();
	for (var i = 0; i < 5; i++) {
		this._renderShimmer(oRm,oControl);
	}
	oRm.close("div");
};

/**
 * Renders the individual shimmer on the ActionTile in the loading state
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.ActionTile} oControl The control that is rendered
 * @private
 */
ToDoCardRenderer._renderShimmer = function(oRm, oControl) {
	oRm.openStart("div")
	.class("sapMGTContentShimmerPlaceholderRows")
	.openEnd();
	oRm.openStart("div")
	.class("sapMGTContentShimmerPlaceholderItemHeader")
	.class("sapMGTLoadingShimmer")
	.openEnd()
	.close("div");
	oRm.openStart("div")
	.class("sapMGTContentShimmerPlaceholderItemText")
	.class("sapMGTLoadingShimmer")
	.openEnd()
	.close("div");
	oRm.close("div");
};


return ToDoCardRenderer;

});
