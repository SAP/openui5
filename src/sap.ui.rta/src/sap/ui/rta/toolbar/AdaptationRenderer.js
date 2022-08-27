/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/toolbar/BaseRenderer"
], function(
	BaseRenderer
) {
	"use strict";

	var AdaptationRenderer = BaseRenderer.extend("sap.ui.rta.toolbar.AdaptationRenderer");

	AdaptationRenderer.apiVersion = 1; // @todo-semantic-rendering out of order .class() call before openStart

	AdaptationRenderer.render = function (oRM, oControl) {
		oRM.class("sapUiRtaToolbarAdaptation");

		BaseRenderer.render(oRM, oControl);
	};

	return AdaptationRenderer;
});
