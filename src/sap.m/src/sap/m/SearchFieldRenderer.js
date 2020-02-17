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
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oSF an object representation of the control that should be rendered
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
			oAccAttributes = {}, // additional accessibility attributes
			sToolTipValue,
			sRefreshToolTip = oSF.getRefreshButtonTooltip(),
			sResetToolTipValue;

		// container
		rm.write("<div");
		rm.writeControlData(oSF);
		if (sWidth) { rm.writeAttribute("style", "width:" + sWidth + ";"); }

		rm.addClass("sapMSF");

		if (sValue) {
			rm.addClass("sapMSFVal");
		}
		if (!oSF.getEnabled()) {
			rm.addClass("sapMSFDisabled");
		}

		rm.writeClasses();
		rm.write(">");

			// 1. Input type="search".
			//    Enclose input into a <form> to show a correct keyboard
			rm.write('<form');
			rm.writeAttribute("id", sId + "-F");
			rm.addClass('sapMSFF');
			if (!bShowSearchBtn) {
				rm.addClass("sapMSFNS"); //no search button
			} else if (bShowRefreshButton) {
				rm.addClass('sapMSFReload');
			}
			rm.writeClasses();
			rm.write('>');

			// self-made placeholder
			if (!oSF._hasPlaceholder && sPlaceholder) {
				rm.write("<label ");
				rm.writeAttribute("id", sId + "-P");
				rm.writeAttribute("for", sId + "-I");

				rm.addClass("sapMSFPlaceholder");
				rm.writeClasses();
				rm.write(">");
				rm.writeEscaped(sPlaceholder);
				rm.write("</label>");
			}

			rm.write('<input');
			rm.writeAttribute("type", "search");
			rm.writeAttribute("autocomplete", "off");

			if (Device.browser.safari) {
				rm.writeAttribute("autocorrect", "off");
			}

			rm.writeAttribute("id", oSF.getId() + "-I");

			var sTooltip = oSF.getTooltip_AsString();
			if (sTooltip) {
				rm.writeAttributeEscaped("title", sTooltip);
			}

			rm.addClass("sapMSFI");

			if (Device.os.android && Device.os.version >= 4 && Device.os.version < 4.1 ) {
				rm.addClass("sapMSFIA4"); // specific CSS layout for Android 4.0x
			}

			rm.writeClasses();

			if (oSF.getEnableSuggestions() && Device.system.phone) {
				// Always open a dialog on a phone if suggestions are on.
				// To avoid soft keyboard flickering, set the readonly attribute.
				rm.writeAttribute("readonly", "readonly");
			}
			if (!oSF.getEnabled()) { rm.writeAttribute("disabled","disabled"); }
			if (sPlaceholder) { rm.writeAttributeEscaped("placeholder", sPlaceholder); }
			if (oSF.getMaxLength()) { rm.writeAttribute("maxLength", oSF.getMaxLength()); }
			if (sValue) { rm.writeAttributeEscaped("value", sValue); }

			//ARIA attributes
			if (oSF.getEnabled() && bShowRefreshButton) {
				var sAriaF5LabelId = InvisibleText.getStaticId("sap.m", "SEARCHFIELD_ARIA_F5");
				if ( sAriaF5LabelId ) {
					oAccAttributes.describedby = {
						value: sAriaF5LabelId,
						append: true
					};
				}
			}

			oAccAttributes.disabled = null;

			rm.writeAccessibilityState(oSF, oAccAttributes);

			rm.write(">");

			if (oSF.getEnabled()) {
				// 2. Reset button
				rm.write("<div");
				rm.writeAttribute("aria-hidden", true);
				rm.writeAttribute("id", oSF.getId() + "-reset");
				sResetToolTipValue = sValue === "" ? this.oSearchFieldToolTips.SEARCH_BUTTON_TOOLTIP : this.oSearchFieldToolTips.RESET_BUTTON_TOOLTIP;
				rm.writeAttributeEscaped("title", sResetToolTipValue); // initial rendering reset is search when no value is set
				rm.addClass("sapMSFR"); // reset
				rm.addClass("sapMSFB"); // button
				if (Device.browser.firefox) {
					rm.addClass("sapMSFBF"); // firefox, active state by preventDefault
				}
				if (!bShowSearchBtn) {
					rm.addClass("sapMSFNS"); //no search button
				}
				rm.writeClasses();
				rm.write("></div>");

				// 3. Search/Refresh button
				if (bShowSearchBtn) {
					rm.write("<div");
					rm.writeAttribute("aria-hidden", true);
					rm.writeAttribute("id", oSF.getId() + "-search");
					rm.addClass("sapMSFS"); // search
					rm.addClass("sapMSFB"); // button
					if (Device.browser.firefox) {
						rm.addClass("sapMSFBF"); // firefox, active state by preventDefault
					}
					rm.writeClasses();
					if (bShowRefreshButton) {
						sToolTipValue = sRefreshToolTip === "" ? this.oSearchFieldToolTips.REFRESH_BUTTON_TOOLTIP : sRefreshToolTip;
					} else {
						sToolTipValue = this.oSearchFieldToolTips.SEARCH_BUTTON_TOOLTIP;
					}
					rm.writeAttributeEscaped("title", sToolTipValue);
					rm.write( "></div>");
				}
			}

			rm.write("</form>");

			if (oSF.getEnableSuggestions()) {
				rm.write('<span id="' + oSF.getId() + '-SuggDescr" class="sapUiPseudoInvisibleText" role="status" aria-live="polite"></span>');
			}

		rm.write("</div>");

	};


	return SearchFieldRenderer;

}, /* bExport= */ true);
