/*
 * !${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/theming/Parameters'
], function(jQuery, Parameters) {
	"use strict";

	/**
	 * ColumnHeader renderer.
	 * @namespace
	 */
	var ColumnHeaderRenderer = {};

	ColumnHeaderRenderer.render = function(oRm, oControl) {
		// container
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (oControl.getTableAdapter().tabbable) {
			// add control in tab chain only if it is tabbable
			oRm.writeAttribute("tabindex", 0);
			oRm.addClass("sapMColumnHeaderFocusable");
		}
		oRm.addClass("sapMColumnHeader");
		oRm.writeClasses();
		oRm.write(">");

		// render title for control
		this.renderText(oRm, oControl);

		// render icons for control
		this.renderIcons(oRm, oControl);

		// container end
		oRm.write("</div>");
	};

	// render title
	ColumnHeaderRenderer.renderText = function(oRm, oControl) {
		// title container
		oRm.write("<div");
		oRm.addClass("sapMColumnHeaderText");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oControl.getText());

		// title container end
		oRm.write("</div>");
	};

	// render icons
	ColumnHeaderRenderer.renderIcons = function(oRm, oControl) {
		// container for control icon(s)
		oRm.write("<div");
		oRm.addClass("sapMColumnHeaderIcons");
		oRm.writeClasses();
		oRm.write(">");

		this.renderSortIcon(oRm, oControl);
		this.renderFilterIcon(oRm, oControl);

		// icons container end
		oRm.write("</div>");
	};

	ColumnHeaderRenderer.renderSortIcon = function(oRm, oControl) {
		var oSortIcon = oControl.getAggregation("_sortIcon");

		if (!oSortIcon) {
			return;
		}

		oRm.renderControl(oSortIcon);
	};

	ColumnHeaderRenderer.renderFilterIcon = function(oRm, oControl) {
		var oFilterIcon = oControl.getAggregation("_filterIcon");

		if (!oFilterIcon) {
			return;
		}

		oRm.renderControl(oFilterIcon);
	};

	return ColumnHeaderRenderer;
}, /* bExport= */true);
