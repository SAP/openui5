/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './TableRenderer'],
	function(jQuery, Renderer, TableRenderer) {
	"use strict";


	/**
	 * AnalyticalTable renderer.
	 * @namespace
	 */
	var AnalyticalTableRenderer = Renderer.extend(TableRenderer);

	AnalyticalTableRenderer.writeRowSelectorContent = function(rm, oTable, oRow, iRowIndex) {
		TableRenderer.writeRowSelectorContent(rm, oTable, oRow, iRowIndex);

		rm.write("<div");
		rm.writeAttribute("id", oRow.getId() + "-groupHeader");
		rm.writeAttribute("class", "sapUiTableGroupIcon");
		rm.writeAttribute("tabindex", "-1");
		rm.write("></div>");

		if ('ontouchstart' in document) {
			var oIconInfo = sap.ui.core.IconPool.getIconInfo("sap-icon://drop-down-list");
			rm.write("<div class='sapUiTableGroupMenuButton'>");
			rm.writeEscaped(oIconInfo.content);
			rm.write("</div>");
		}
	};

	return AnalyticalTableRenderer;

}, /* bExport= */ true);
