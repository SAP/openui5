/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device", "sap/ui/core/InvisibleText"],
	function(Device, InvisibleText) {
	"use strict";


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

		var sPlaceholder = oSF.getPlaceholder(),
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

			// self-made placeholder
			if (!oSF._hasPlaceholder && sPlaceholder) {
				rm.openStart("label", sId + "-P")
					.class("sapMSFPlaceholder")
					.attr("for", sId + "-I")
					.openEnd()
					.text(sPlaceholder)
					.close("label");
			}

			rm.voidStart('input', oSF.getId() + "-I")
				.class("sapMSFI")
				.attr("type", "search")
				.attr("autocomplete", "off");

			if (Device.browser.safari) {
				rm.attr("autocorrect", "off");
			}

			var sTooltip = oSF.getTooltip_AsString();
			if (sTooltip) {
				rm.attr("title", sTooltip);
			}

			if (Device.os.android && Device.os.version >= 4 && Device.os.version < 4.1 ) {
				rm.class("sapMSFIA4"); // specific CSS layout for Android 4.0x
			}

			if (oSF.getEnableSuggestions() && Device.system.phone) {
				// Always open a dialog on a phone if suggestions are on.
				// To avoid soft keyboard flickering, set the readonly attribute.
				rm.attr("readonly", "readonly");
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
				rm.openStart("div", oSF.getId() + "-reset")
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
					rm.openStart("div", oSF.getId() + "-search")
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

				rm.openStart("span", oSF.getId() + "-SuggDescr")
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
