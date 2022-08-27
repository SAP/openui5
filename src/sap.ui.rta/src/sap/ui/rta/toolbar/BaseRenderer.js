/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/m/HBoxRenderer"
],
function(
	Renderer,
	HBoxRenderer
) {
	"use strict";

	var BaseRenderer = Renderer.extend.call(HBoxRenderer, "sap.ui.rta.toolbar.BaseRenderer");

	BaseRenderer.apiVersion = 1; // @todo-semantic-rendering out of order .class() and .style() calls before openStart

	BaseRenderer.render = function (oRM, oControl) {
		oRM.class("sapUiRtaToolbar");
		oRM.class("color_" + oControl.getColor());

		// setting type if exists
		oControl.type && oRM.class("type_" + oControl.type);

		// setting z-index if exists
		var iZIndex = oControl.getZIndex();
		iZIndex && oRM.style("z-index", iZIndex);

		HBoxRenderer.render(oRM, oControl);
	};


	return BaseRenderer;
});
