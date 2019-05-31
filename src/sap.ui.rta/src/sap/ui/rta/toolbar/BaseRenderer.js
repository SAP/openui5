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

	var BaseRenderer = Renderer.extend.call(HBoxRenderer, 'sap.ui.rta.toolbar.BaseRenderer');

	BaseRenderer.render = function (oRM, oControl) {
		oRM.addClass('sapUiRtaToolbar');
		oRM.addClass("color_" + oControl.getColor());

		// setting type if exists
		oControl.type && oRM.addClass("type_" + oControl.type);

		// setting z-index if exists
		var iZIndex = oControl.getZIndex();
		iZIndex && oRM.addStyle("z-index", iZIndex);

		HBoxRenderer.render(oRM, oControl);
	};


	return BaseRenderer;
});
