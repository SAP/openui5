/*!
 * ${copyright}
 */

sap.ui.define([], function() {
"use strict";

/**
 * TileAttributeRenderer
 * @namespace
 */
var TileAttributeRenderer = {
	apiVersion: 2    // enable in-place DOM patching
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.ActionTileContent} oControl An object representation of the control that is rendered
 */
TileAttributeRenderer.render = function(oRm, oControl) {
	oRm.openStart("div",oControl.getId());
	oRm.class("sapMElementWrapper");
	oRm.openEnd();
	this._renderLabel(oRm,oControl);
	this._renderValue(oRm,oControl);
	oRm.close("div");
};

/**
 * Renders label and value properties inside the TileAttribute
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.ActionTileContent} oControl The control that is rendered
 * @private
 */
TileAttributeRenderer._renderLabel = function(oRm, oControl) {
	var sClassName = "sapMATCLabel",
		sId = "-label",
		sText = oControl.getLabel();
	oRm.openStart("div", oControl.getId() + "-"  + sId);
	oRm.class(sClassName);
	oRm.openEnd();
	oRm.text(sText);
	oRm.close("div");
};

/**
 * Renders label and value properties inside the TileAttribute
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.ActionTileContent} oControl The control that is rendered
 * @private
 */
TileAttributeRenderer._renderValue = function(oRm, oControl) {
	var sClassName = "sapMATCValue",
		sId = "-value";
		oRm.openStart("div", oControl.getId() + "-"  + sId);
		oRm.class(sClassName);
		oRm.openEnd();
	var oConfig = oControl.getContentConfig();
		if (oConfig) {
			oRm.renderControl(oConfig._getConfigInstance());
		}
		oRm.close("div");
};
return TileAttributeRenderer;
});