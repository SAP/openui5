/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Renderer',
	'sap/ui/mdc/enums/FieldEditMode'
], function(
	Renderer,
	FieldEditMode
) {
	"use strict";

	/**
	 * FieldBase renderer.
	 * @namespace
	 */
	var FieldBaseRenderer = Renderer.extend("sap.ui.mdc.field.FieldBaseRenderer");

	FieldBaseRenderer = Object.assign(FieldBaseRenderer, {
		apiVersion: 2
	});

	FieldBaseRenderer.render = function(oRm, oField) {
		var aContent = oField.getCurrentContent();
		var sWidth = oField.getWidth();
		var aConditions = oField.getConditions();
		var sEditMode = oField.getEditMode();
		var bShowEmptyIndicator = oField.getShowEmptyIndicator() && aConditions.length === 0 && sEditMode === FieldEditMode.Display && !oField.getContent() && !oField.getContentDisplay();

		oRm.openStart("div", oField);
		oRm.class("sapUiMdcFieldBase");

		if (aContent.length > 1) {
			oRm.class("sapUiMdcFieldBaseMoreFields");
		}

		if (bShowEmptyIndicator) {
			oRm.class("sapMShowEmpty-CTX"); // to allow the Text control determine if empty indicator is needed or not
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
