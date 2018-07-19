/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Renderer',
	'./BaseRenderer'
],
function(
	Renderer,
	BaseRenderer
) {
	"use strict";

	var AdaptationRenderer = Renderer.extend('sap.ui.rta.toolbar.AdaptationRenderer', BaseRenderer);

	AdaptationRenderer.render = function (oRM, oControl) {
		oRM.addClass('sapUiRtaToolbarAdaptation');

		BaseRenderer.render(oRM, oControl);
	};


	return AdaptationRenderer;
});
