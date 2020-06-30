/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/IconPool'],
		function(Renderer, IconPool) {
	"use strict";

	// initialize the Icon Pool
	IconPool.insertFontFaceStyle();

	/**
	 * FieldBase renderer.
	 * @namespace
	 */
	var FieldBaseRenderer = Renderer.extend("sap.ui.mdc.field.FieldBaseRenderer");

	FieldBaseRenderer = Object.assign(FieldBaseRenderer, {
		apiVersion: 2
	});

	FieldBaseRenderer.render = function(oRm, oField) {
		var aContent = oField._getContent();
		var sWidth = oField.getWidth();

		oRm.openStart("div", oField);
		oRm.class("sapUiMdcBaseField");

		if (aContent.length > 1) {
			oRm.class("sapUiMdcBaseFieldMoreFields");
		}

		oRm.style("width", sWidth);
		oRm.openEnd();

		for (var i = 0; i < aContent.length; i++) {
			var oContent = aContent[i];
			oRm.renderControl(oContent);
		}

		oRm.close("div");
	};

	return FieldBaseRenderer;
});
