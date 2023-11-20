/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * IndexPickerRenderer renderer.
	 * @namespace
	 */
	var IndexPickerRenderer = { apiVersion: 2 };

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.unified.calendar.IndexPicker} oPicker
	 *            the picker to be rendered
	 */
	IndexPickerRenderer.render = function(oRm, oPicker) {
		var iCurrentIndex,
			mAccProps = {
				role: "gridcell",
				selected: false,
				label: "",
				describedby: ""
			};

		oRm.openStart("div", oPicker);
		oRm.class("sapMIP");
		oRm.openEnd();

		var oHeader = oPicker.getAggregation("header");
		oRm.renderControl(oHeader);

		oRm.openStart("div");
		oRm.class("sapMIPContent");
		oRm.attr("role", "grid");
		oRm.openEnd();

		for (var i = 0; i < oPicker.getRows(); i++) {
			oRm.openStart("div", oPicker.getId() + "-" + i);
			oRm.class("sapMIPRow");
			oRm.attr("role", "row");
			oRm.openEnd();

			var iSelectionEndIndex = oPicker.getSelectedIndex() + oPicker.getPeriodSize() - 1;

			for (var j = 0; j < oPicker.getColumns(); j++) {
				iCurrentIndex = oPicker.getStartIndex() + oPicker.getColumns() * i + j;

				oRm.openStart("div");
				oRm.class("sapMIPItem");
				if (iCurrentIndex === oPicker.getSelectedIndex()) {
					oRm.class("sapUiCalItemSel");
					oRm.class("sapUiCalItemSelStart");
					mAccProps["selected"] = true;
					mAccProps["describedby"] = mAccProps["describedby"] + " " + oPicker.sId + "-Start";
				} else if (iCurrentIndex === iSelectionEndIndex) {
					oRm.class("sapUiCalItemSel");
					oRm.class("sapUiCalItemSelEnd");
					mAccProps["selected"] = true;
					mAccProps["describedby"] = mAccProps["describedby"] + " " + oPicker.sId + "-End";
				} else if (iCurrentIndex > oPicker.getSelectedIndex() && iCurrentIndex < iSelectionEndIndex) {
					oRm.class("sapUiCalItemSel");
					oRm.class("sapUiCalItemSelBetween");
					mAccProps["selected"] = true;
				} else {
					mAccProps["selected"] = false;
				}

				oRm.accessibilityState(null, mAccProps);

				oRm.class('sapUiCalItem');
				oRm.class("customWidth");
				oRm.attr("tabindex", "-1");
				oRm.attr("data-sap-ui-index", iCurrentIndex);
				oRm.openEnd();

				oRm.text(oPicker._getFormatter()(iCurrentIndex));

				oRm.close("div");
			}
			oRm.close("div");
		}

		oRm.close("div"); //content
		oRm.close("div"); //main
	};

	return IndexPickerRenderer;

}, true);