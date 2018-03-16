/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.Menu
sap.ui.define([],
	function() {
	"use strict";



	/**
	 * Currency renderer.
	 *
	 * @version ${version}
	 * @namespace
	 */
	var CurrencyRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm The RenderManager that can be used for writing to the render-output-buffer.
	 * @param {sap.ui.core.Control}
	 *            oCurrency An object representation of the control that should be rendered
	 */
	CurrencyRenderer.render = function(oRm,oCurrency) {
		var sTooltip = oCurrency.getTooltip_AsString();

		oRm.write("<div");
		oRm.writeControlData(oCurrency);

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		oRm.addClass("sapUiUfdCurrency");
		if (oCurrency._bRenderNoValClass) {
			oRm.addClass("sapUiUfdCurrencyNoVal");
		}
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("<div");
		oRm.addClass("sapUiUfdCurrencyAlign");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("<span");
		// The currency value should always be displayed in ltr direction
		oRm.writeAttribute("dir", "ltr");
		oRm.addClass("sapUiUfdCurrencyValue");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oCurrency.getFormattedValue());
		oRm.write("</span>");
		oRm.write("<span");
		oRm.addClass("sapUiUfdCurrencyCurrency");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oCurrency._getCurrency());
		oRm.write("</span>");
		oRm.write("</div>");
		oRm.write("</div>");
	};

	return CurrencyRenderer;

}, /* bExport= */ true);
