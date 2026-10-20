/*!
 * ${copyright}
 */

// Provides renderer for sap.m.table.Title
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/format/NumberFormat"
],
	function(Library, NumberFormat) {
	"use strict";

	/**
	 * Title renderer.
	 * @namespace
	 */
	const TitleRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used to render the control's DOM
	 * @param {sap.m.table.Title} oTitle An object representation of the control that is rendered
	 */
	TitleRenderer.render = function(oRm, oTitle){
		const oExternalTitle = oTitle.getTitle();

		const oNumberFormat = NumberFormat.getIntegerInstance({groupingEnabled: true});
		const iTotalCount = oTitle.getTotalCount();
		const iSelectedCount = oTitle.getSelectedCount();
		const sTotalCountFormatted = oNumberFormat.format(oTitle.getTotalCount());
		const sSelectedCountFormatted = oNumberFormat.format(oTitle.getSelectedCount());
		const oResourceBundle = Library.getResourceBundleFor("sap.m");
		let sText;

		oRm.openStart("div", oTitle);
		if (!oTitle.getVisible()) {
			oRm.style("display", "none");
		}
		oRm.class("sapMTableTitle");
		oRm.openEnd();

		oRm.renderControl(oExternalTitle);

		oRm.openStart("span", oTitle.getId() + "-tableTitleContent");
		oRm.class("sapMTableTitleText");
		if (iSelectedCount > 0 && iTotalCount > 0) {
			oRm.class("sapMTableTitleSelectedRowCount");
			if (oTitle.getShowExtendedView()) {
				const sExtKey = oTitle.getContext() === "List" ? "TABLETITLE_SELECTED_ITEM_COUNT_EXT" : "TABLETITLE_SELECTED_ROW_COUNT_EXT";
				sText = oResourceBundle.getText(sExtKey, [sSelectedCountFormatted, sTotalCountFormatted]);

			} else {
				sText = oResourceBundle.getText("TABLETITLE_SELECTED_ROW_COUNT_COMP", [sSelectedCountFormatted, sTotalCountFormatted]);
			}
		} else if (iTotalCount > 0) {
			oRm.class("sapMTableTitleTotalCount");
			sText = sTotalCountFormatted;
		} else if (iSelectedCount > 0) {
			oRm.class("sapMTableTitleSelectedCount");
			sText = oResourceBundle.getText("TABLETITLE_SELECTED_COUNT_ONLY", [sSelectedCountFormatted]);
		}
		oRm.openEnd();
		if (sText) {
			oRm.text(`(${sText})`);
		}
		oRm.close("span");

		oRm.close("div");
	};

	return TitleRenderer;
}, /* bExport= */ true);
