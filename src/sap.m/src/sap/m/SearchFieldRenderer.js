/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/library"
],
	function(
	Device,
	Core,
	InvisibleText,
	coreLibrary
) {
	"use strict";

	/**
	 * @const Shortcut to sap.ui.core.library.aria.HasPopup
	 */
	var HasPopup = coreLibrary.aria.HasPopup;

	/**
	 * SearchField renderer.
	 * @namespace
	 */
	var SearchFieldRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.SearchField} oSF an object representation of the control that should be rendered
	 */
	SearchFieldRenderer.render = function(rm, oSF){
		// render nothing if control is invisible
		if (!oSF.getVisible()) {
			return;
		}

		var sPlaceholder = oSF.getPlaceholder() || Core.getLibraryResourceBundle("sap.m").getText("FACETFILTER_SEARCH", true),
			sValue = oSF.getValue(),
			sWidth = oSF.getProperty("width"),
			sId = oSF.getId(),
			bShowRefreshButton = oSF.getShowRefreshButton(),
			bShowSearchBtn = oSF.getShowSearchButton(),
			oAccAttributes = {
				describedby: {
					value: SearchFieldRenderer._getDescribedBy(oSF),
					append: true
				}
			},
			sToolTipValue,
			sRefreshToolTip = oSF.getRefreshButtonTooltip(),
			sResetToolTipValue;

		// container
		rm.openStart("div", oSF)
			.class("sapMSF");

		if (sWidth) {
			rm.style("width", sWidth);
		}

		if (sValue) {
			rm.class("sapMSFVal");
		}

		if (!oSF.getEnabled()) {
			rm.class("sapMSFDisabled");
		}

		rm.openEnd();

			// 1. Input type="search".
			//    Enclose input into a <form> to show a correct keyboard
			rm.openStart('form', sId + "-F")
				.class('sapMSFF');

			if (!bShowSearchBtn) {
				rm.class("sapMSFNS"); //no search button
			} else if (bShowRefreshButton) {
				rm.class('sapMSFReload');
			}

			rm.openEnd();

			rm.voidStart('input', sId + "-I")
				.class("sapMSFI")
				.attr("type", "search")
				.attr("aria-label", sPlaceholder)
				.attr("autocomplete", "off");

			if (oSF.getEnableSuggestions()) {
				rm.attr("aria-haspopup", HasPopup.ListBox.toLowerCase());
			}

			if (Device.browser.safari) {
				rm.attr("autocorrect", "off");
			}

			var sTooltip = oSF.getTooltip_AsString();
			if (sTooltip) {
				rm.attr("title", sTooltip);
			}

			if (oSF.getEnableSuggestions() && Device.system.phone) {
				// Always open a dialog on a phone if suggestions are on.
				// avoid soft keyboard flickering
				rm.attr("inputmode", "none");
			}

			if (!oSF.getEnabled()) {
				rm.attr("disabled", "disabled");
			}

			if (sPlaceholder) {
				rm.attr("placeholder", sPlaceholder);
			}

			if (oSF.getMaxLength()) {
				rm.attr("maxLength", oSF.getMaxLength());
			}

			rm.attr("value", sValue);

			oAccAttributes.disabled = null;

			rm.accessibilityState(oSF, oAccAttributes);

			rm.voidEnd();

			if (oSF.getEnabled()) {
				// 2. Reset button
				rm.openStart("div", sId + "-reset")
					.class("sapMSFR") // reset
					.class("sapMSFB") // button
					.attr("aria-hidden", true);

				sResetToolTipValue = sValue === "" ? this.oSearchFieldToolTips.SEARCH_BUTTON_TOOLTIP : this.oSearchFieldToolTips.RESET_BUTTON_TOOLTIP;
				rm.attr("title", sResetToolTipValue); // initial rendering reset is search when no value is set

				if (Device.browser.firefox) {
					rm.class("sapMSFBF"); // firefox, active state by preventDefault
				}

				if (!bShowSearchBtn) {
					rm.class("sapMSFNS"); //no search button
				}

				rm.openEnd()
					.close("div");

				// 3. Search/Refresh button
				if (bShowSearchBtn) {
					rm.openStart("div", sId + "-search")
						.class("sapMSFS") // search
						.class("sapMSFB") // button
						.attr("aria-hidden", true);

					if (Device.browser.firefox) {
						rm.class("sapMSFBF"); // firefox, active state by preventDefault
					}

					if (bShowRefreshButton) {
						sToolTipValue = sRefreshToolTip === "" ? this.oSearchFieldToolTips.REFRESH_BUTTON_TOOLTIP : sRefreshToolTip;
					} else {
						sToolTipValue = this.oSearchFieldToolTips.SEARCH_BUTTON_TOOLTIP;
					}

					rm.attr("title", sToolTipValue)
						.openEnd()
						.close("div");
				}
			}

			rm.close("form");

			if (oSF.getEnableSuggestions()) {

				rm.openStart("span", sId + "-SuggDescr")
					.class("sapUiPseudoInvisibleText")
					.attr("role", "status")
					.attr("aria-live", "polite")
					.openEnd()
					.close("span");
			}

		rm.close("div");
	};

	SearchFieldRenderer._getDescribedBy = function (oSF) {
		var sDescribedBy = InvisibleText.getStaticId("sap.m", "SEARCHFIELD_ARIA_DESCRIBEDBY");

		if (oSF.getEnabled() && oSF.getShowRefreshButton()) {
			sDescribedBy += " " + InvisibleText.getStaticId("sap.m", "SEARCHFIELD_ARIA_F5");
		}

		return sDescribedBy;
	};

	return SearchFieldRenderer;

}, /* bExport= */ true);
