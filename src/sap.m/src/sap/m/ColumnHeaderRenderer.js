/*
 * !${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * ColumnHeader renderer.
	 * @namespace
	 */
	var ColumnHeaderRenderer = {};

	ColumnHeaderRenderer.render = function(oRm, oControl) {
		var sControlId = oControl.getId();
		var bInteractive = oControl._isInteractive();
		// container
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (bInteractive) {
			// add control in tab chain only if it is interactive
			oRm.writeAttribute("tabindex", 0);
			oRm.writeAttribute("role", "button");
			oRm.addClass("sapMColumnHeaderFocusable");
			oRm.writeAttributeEscaped("aria-labelledby", sControlId + "-info");
			oRm.addClass("sapMColumnHeaderActive");
		}
		oRm.addClass("sapMColumnHeader");
		oRm.writeClasses();
		oRm.write(">");

		// render title for control
		this.renderText(oRm, oControl);

		// render icons for control
		this.renderIcons(oRm, oControl);

		// no special screen reader support for Grid Table
		if (bInteractive && sap.ui.getCore().getConfiguration().getAccessibility()) {
			// hidden span
			oRm.write("<span");
			oRm.writeAttributeEscaped("id", sControlId + "-info");
			oRm.addClass("sapUiInvisibleText");
			oRm.writeClasses();
			oRm.writeAttributeEscaped("aria-hidden", "true");
			oRm.write(">");
			oRm.writeEscaped(oControl.getAccessibilityInfo().description);
			oRm.write("</span>");
		}

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
