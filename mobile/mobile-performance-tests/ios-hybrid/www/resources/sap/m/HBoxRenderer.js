/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.HBoxRenderer");
jQuery.sap.require("sap.m.FlexBoxRenderer");

/**
 * @class HBox renderer.
 * @static
 */
sap.m.HBoxRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.HBoxRenderer.render = function(oRm, oControl){
	sap.m.FlexBoxRenderer.render.apply(this, [oRm, oControl]);
};
