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
		apiVersion: 2
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

		oRm.openStart("div", oCurrency);

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.class("sapUiUfdCurrency");
		if (oCurrency._bRenderNoValClass) {
			oRm.class("sapUiUfdCurrencyNoVal");
		}
		oRm.openEnd();
		oRm.openStart("div");
		oRm.class("sapUiUfdCurrencyAlign");
		oRm.openEnd();
		oRm.openStart("span");
		// The currency value should always be displayed in ltr direction
		oRm.attr("dir", "ltr");
		oRm.class("sapUiUfdCurrencyValue");
		oRm.openEnd();
		oRm.text(oCurrency.getFormattedValue());
		oRm.close("span");
		oRm.openStart("span");
		oRm.class("sapUiUfdCurrencyCurrency");
		oRm.openEnd();
		oRm.text(oCurrency._getCurrency());
		oRm.close("span");
		oRm.close("div");
		oRm.close("div");
	};

	return CurrencyRenderer;

}, /* bExport= */ true);
