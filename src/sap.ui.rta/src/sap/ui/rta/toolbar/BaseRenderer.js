/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Renderer',
	'sap/m/HBoxRenderer'
],
function(
	Renderer,
	HBoxRenderer
) {
	"use strict";

	var BaseRenderer = Renderer.extend('sap.ui.rta.toolbar.BaseRenderer', HBoxRenderer);

	BaseRenderer.render = function (oRM, oControl) {
		oRM.addClass('sapUiRtaToolbar');
		oRM.addClass('sapContrastPlus'); // for 'sap_belize_plus' theme
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
