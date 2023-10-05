/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.Menu
sap.ui.define(["sap/m/library", "sap/ui/core/Core", "sap/ui/core/Lib"],
	function(mobileLibrary, Core, Lib) {
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

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode;

	// shortcut for library resource bundle
	var oRb = Lib.getResourceBundleFor("sap.m");

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm The RenderManager that can be used for writing to the render-output-buffer.
	 * @param {sap.ui.unified.Currency}
	 *            oCurrency An object representation of the control that should be rendered
	 */
	CurrencyRenderer.render = function(oRm,oCurrency) {
		var sTooltip = oCurrency.getTooltip_AsString();

		oRm.openStart("div", oCurrency);

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.class("sapUiUfdCurrency");

		if (oCurrency.getEmptyIndicatorMode() !== EmptyIndicatorMode.Off && !oCurrency.getValue()) {
			oRm.openEnd();
			this.renderEmptyIndicator(oRm, oCurrency);
		} else {
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
		}
		oRm.close("div");
	};

	/**
	 * Renders the empty text indicator.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.unified.Currency} oCurrency An object representation of the control that should be rendered.
	 */
	CurrencyRenderer.renderEmptyIndicator = function(oRm, oCurrency) {
		oRm.openStart("span");
			oRm.class("sapMEmptyIndicator");
			if (oCurrency.getEmptyIndicatorMode() === EmptyIndicatorMode.Auto) {
				oRm.class("sapMEmptyIndicatorAuto");
			}
			oRm.openEnd();
			oRm.openStart("span");
			oRm.attr("aria-hidden", true);
			oRm.openEnd();
				oRm.text(oRb.getText("EMPTY_INDICATOR"));
			oRm.close("span");
			//Empty space text to be announced by screen readers
			oRm.openStart("span");
			oRm.class("sapUiPseudoInvisibleText");
			oRm.openEnd();
				oRm.text(oRb.getText("EMPTY_INDICATOR_TEXT"));
			oRm.close("span");
		oRm.close("span");
	};

	return CurrencyRenderer;

}, /* bExport= */ true);
