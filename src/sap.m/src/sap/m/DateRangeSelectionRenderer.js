/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './DatePickerRenderer'],
	function(jQuery, Renderer, DatePickerRenderer) {
	"use strict";


	/**
	 * DateRangeSelection renderer.
	 * @namespace
	 */
	var DateRangeSelectionRenderer = Renderer.extend(DatePickerRenderer);

	/**
	 * Write the value of the input.
	 *
	 * @public
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	DateRangeSelectionRenderer.writeInnerValue = function(oRm, oControl) {

		if (oControl._bValid) {
			oRm.writeAttributeEscaped("value", oControl._formatValue(oControl.getDateValue(), oControl.getSecondDateValue()));
		} else {
			oRm.writeAttributeEscaped("value", oControl.getValue());
		}

	};

	return DateRangeSelectionRenderer;

}, /* bExport= */ true);
