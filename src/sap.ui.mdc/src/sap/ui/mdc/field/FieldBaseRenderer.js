/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Renderer',
	'sap/ui/core/IconPool',
	'sap/ui/mdc/enum/EditMode'
], function(
	Renderer,
	IconPool,
	EditMode
) {
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
		var aConditions = oField.getConditions();
		var sEditMode = oField.getEditMode();
		var bShowEmptyIndicator = oField.getShowEmptyIndicator() && aConditions.length === 0 && sEditMode === EditMode.Display && !oField.getContent() && !oField.getContentDisplay();

		oRm.openStart("div", oField);
		oRm.class("sapUiMdcFieldBase");

		if (aContent.length > 1) {
			oRm.class("sapUiMdcFieldBaseMoreFields");
		}

		oRm.style("width", sWidth);
		oRm.openEnd();

		// render empty indicator in display mode
		if (bShowEmptyIndicator) {
			// invisible text for screenreader
			oRm.openStart("span");
			oRm.class("sapUiPseudoInvisibleText");
			oRm.openEnd();
			oRm.text(oField._oResourceBundle.getText("field.NO_VALUE"));
			oRm.close("span");

			// element for empty indicator
			oRm.openStart("span");
			oRm.attr("aria-hidden", "true");
			oRm.attr("emptyIndicator", oField._oResourceBundle.getText("field.EMPTY_INDICATOR"));
			oRm.class("sapMText");
			oRm.class("sapUiSelectable");
			oRm.class("sapMTextMaxWidth");
			oRm.class("sapUiMdcFieldBaseEmpty");
			oRm.openEnd();
			oRm.close("span");
		} else {
			for (var i = 0; i < aContent.length; i++) {
				var oContent = aContent[i];
				oRm.renderControl(oContent);
			}
		}

		oRm.close("div");
	};

	return FieldBaseRenderer;
});
