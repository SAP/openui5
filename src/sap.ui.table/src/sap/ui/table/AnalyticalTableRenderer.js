/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/IconPool', 'sap/ui/core/Renderer', './TableRenderer'],
	function(jQuery, IconPool, Renderer, TableRenderer) {
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
		rm.write("></div>");

		if ('ontouchstart' in document) {
			var oIconInfo = IconPool.getIconInfo("sap-icon://drop-down-list");
			rm.write("<div class='sapUiTableGroupMenuButton'>");
			rm.writeEscaped(oIconInfo.content);
			rm.write("</div>");
		}
	};

	return AnalyticalTableRenderer;

}, /* bExport= */ true);
