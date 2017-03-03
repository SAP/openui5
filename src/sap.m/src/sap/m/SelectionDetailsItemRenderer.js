/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global", "sap/ui/core/Renderer", "sap/m/ListItemBaseRenderer"],
	function(jQuery, Renderer, ListItemBaseRenderer) {
	"use strict";

	/**
	 * SelectionDetailsItemRenderer renderer.
	 * @namespace
	 */
	var SelectionDetailsListItem = Renderer.extend(ListItemBaseRenderer);

	SelectionDetailsListItem.renderLIAttributes = function(oRm, oControl) {
		oRm.addClass("sapMSDItem");
		oRm.writeClasses();
	};

	SelectionDetailsListItem.renderLIContent = function(oRm, oControl) {
		var aFields = oControl._getData().getFields();

		for (var i = 0; i < aFields.length; i++) {
			this.renderField(oRm, oControl, aFields[i]);
		}
	};

	SelectionDetailsListItem.renderField = function(oRm, oControl, field) {
		var sUnit = field.getUnit().trim(),
			sValue = field.getValue(),
			sDisplayValue = field.getDisplayValue();

		oRm.write("<div");
		oRm.addClass("sapMSDItemField");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapMSDItemFieldLabel");
		oRm.writeClasses();
		oRm.write(">");

		oRm.writeEscaped(field.getLabel());

		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapMSDItemFieldValue");
		if (sUnit) {
			oRm.addClass("sapMSDItemFieldBold");
		}
		oRm.writeClasses();
		oRm.write(">");

		if (sDisplayValue) {
			oRm.writeEscaped(sDisplayValue);
		} else {
			oRm.writeEscaped(sValue);
		}

		if (sUnit) {
			oRm.write("<span");
			oRm.addClass("sapMSDItemFieldUnit");
			oRm.writeClasses();
			oRm.write(">");

			oRm.writeEscaped(sUnit);

			oRm.write("</span>");
		}

		oRm.write("</div>");

		oRm.write("</div>");
	};

	return SelectionDetailsListItem;

}, /* bExport= */ true);
