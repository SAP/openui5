/*!
 * ${copyright}
 */

sap.ui.define([
	'./BaseRenderer'
],
function(
	BaseRenderer
) {
	"use strict";

	var AdaptationRenderer = BaseRenderer.extend('sap.ui.rta.toolbar.AdaptationRenderer');

	AdaptationRenderer.render = function (oRM, oControl) {
		oRM.addClass('sapUiRtaToolbarAdaptation');

		BaseRenderer.render(oRM, oControl);
	};

	return AdaptationRenderer;
});
