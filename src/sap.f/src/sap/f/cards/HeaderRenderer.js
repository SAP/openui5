/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/f/cards/BaseHeaderRenderer",
	"sap/ui/core/Renderer"
], function (BaseHeaderRenderer, Renderer) {
	"use strict";

	var HeaderRenderer = Renderer.extend(BaseHeaderRenderer);
	HeaderRenderer.apiVersion = 2;

	return HeaderRenderer;
});
