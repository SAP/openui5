/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Renderer', './DatePickerRenderer'],
	function(Renderer, DatePickerRenderer) {
	"use strict";


	/**
	 * DateRangeSelection renderer.
	 * @namespace
	 */
	var DateRangeSelectionRenderer = Renderer.extend(DatePickerRenderer);
	DateRangeSelectionRenderer.apiVersion = 2;

	/**
	 * Write the value of the input.
	 *
	 * @public
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	DateRangeSelectionRenderer.writeInnerValue = function(oRm, oControl) {

		if (oControl._bValid) {
			oRm.attr("value", oControl._formatValue(oControl.getDateValue(), oControl.getSecondDateValue()));
		} else {
			oRm.attr("value", oControl.getValue());
		}

	};

	return DateRangeSelectionRenderer;

}, /* bExport= */ true);
