/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/security/encodeXML"],
	function(encodeXML) {
	"use strict";


	var MAX_HEADER_BUTTONS = 5;

	/**
	 * Header renderer.
	 * @namespace
	 */
	var HeaderRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.Header} oHead an object representation of the control that should be rendered
	 */
	HeaderRenderer.render = function(oRm, oHead){
		var sLanguage = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
		var sTooltip = oHead.getTooltip_AsString();
		var sId = oHead.getId();
		var mAccProps = {};
		var sLabelNext = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("CALENDAR_BTN_NEXT");
		var sLabelPrev = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("CALENDAR_BTN_PREV");

		oRm.openStart("div", oHead);
		oRm.class("sapUiCalHead");

		if (sTooltip) {
			oRm.attr('title', sTooltip);
		}

		oRm.accessibilityState(oHead);

		oRm.openEnd(); // div element

		oRm.openStart("button", sId + '-prev');
		oRm.attr("title", sLabelPrev);
		oRm.accessibilityState(null, { label: sLabelPrev});

		oRm.class("sapUiCalHeadPrev");
		if (!oHead.getEnabledPrevious()) {
			oRm.class("sapUiCalDsbl");
			oRm.attr('disabled', "disabled");
		}
		oRm.attr('tabindex', "-1");
		oRm.openEnd(); // button element
		oRm.icon("sap-icon://slim-arrow-left", null, { title: null });
		oRm.close("button");

		var iFirst = -1;
		var iLast = -1;
		var i = 0;
		var iBtn;
		for (i = 0; i < MAX_HEADER_BUTTONS; i++) {
			if (this.getVisibleButton(oHead, i)) {
				if (iFirst < 0) {
					iFirst = i;
				}
				iLast = i;
			}
		}

		for (i = 0; i < MAX_HEADER_BUTTONS; i++) {
			// for Chinese and Japanese the date should be displayed in year, month, day order
			if (sLanguage.toLowerCase() === "ja" || sLanguage.toLowerCase() === "zh") {
				iBtn = MAX_HEADER_BUTTONS - 1 - i;
				// when we have two months displayed next to each other, we have 4 buttons
				// and they should be arranged in order to show year, first month, year, second month
				// this is why the numbers of the buttons are hard-coded
				if (this._isTwoMonthsCalendar(oHead)) {
					switch (i) {
						case 0:
							iBtn = 2;
							break;
						case 2:
							iBtn = 4;
							break;
						case 1:
							iBtn = 1;
							break;
						case 3:
							iBtn = 3;
							break;
					}
				}
			} else {
				iBtn = i;
			}
			if (this._isTwoMonthsCalendar(oHead)) {
				iFirst = 2;
				iLast = 3;
			}
			this.renderCalendarButtons(oRm, oHead, sId, iFirst, iLast, mAccProps, iBtn);
		}

		oRm.openStart("button", sId + '-next');
		oRm.attr("title", sLabelNext);
		oRm.accessibilityState(null, { label: sLabelNext});

		oRm.class("sapUiCalHeadNext");
		if (!oHead.getEnabledNext()) {
			oRm.class("sapUiCalDsbl");
			oRm.attr('disabled', "disabled");
		}
		oRm.attr('tabindex', "-1");
		oRm.openEnd(); // button element
		oRm.icon("sap-icon://slim-arrow-right", null, { title: null });
		oRm.close("button");

		oRm.close("div");

	};

	HeaderRenderer.renderCalendarButtons = function (oRm, oHead, sId, iFirst, iLast, mAccProps, i) {
		if (this.getVisibleButton(oHead, i)) {
			oRm.openStart("button", sId + '-B' + i);
			oRm.class("sapUiCalHeadB");
			oRm.class("sapUiCalHeadB" + i);
			if (iFirst === i) {
				oRm.class("sapUiCalHeadBFirst");
			}
			if (iLast === i) {
				oRm.class("sapUiCalHeadBLast");
			}
			oRm.attr('tabindex', "-1");
			if (this.getAriaLabelButton(oHead, i)) {
				mAccProps["label"] = this.getAriaLabelButton(oHead, i);
			}
			oRm.accessibilityState(null, mAccProps);
			mAccProps = {};
			oRm.openEnd(); // button element
			var sText = this.getTextButton(oHead, i) || "";
			var sAddText = this.getAdditionalTextButton(oHead, i) || "";
			if (sAddText) {
				oRm.openStart("span", sId + '-B' + i + "-Text");
				oRm.class("sapUiCalHeadBText");
				oRm.openEnd(); // span element
				oRm.text(sText);
				oRm.close("span");

				oRm.openStart("span", sId + '-B' + i + "-AddText");
				oRm.class("sapUiCalHeadBAddText");
				oRm.openEnd(); // span element
				oRm.text(sAddText);
				oRm.close("span");
			} else {
				oRm.text(sText);
			}
			oRm.close("button");
		}
	};

	HeaderRenderer.getVisibleButton = function (oHead, iButton) {
		var bVisible = false;

		if (oHead["getVisibleButton" + iButton]) {
			bVisible = oHead["getVisibleButton" + iButton]();
		} else if (oHead["_getVisibleButton" + iButton]) {
			bVisible = oHead["_getVisibleButton" + iButton]();
		}

		return bVisible;
	};

	HeaderRenderer.getAriaLabelButton = function (oHead, iButton) {
		var sAriaLabel;

		if (oHead["getAriaLabelButton" + iButton]) {
			sAriaLabel = oHead["getAriaLabelButton" + iButton]();
		} else if (oHead["_getAriaLabelButton" + iButton]) {
			sAriaLabel = oHead["_getAriaLabelButton" + iButton]();
		}

		return sAriaLabel;
	};

	HeaderRenderer.getTextButton = function (oHead, iButton) {
		var sText;

		if (oHead["getTextButton" + iButton]) {
			sText = oHead["getTextButton" + iButton]();
		} else if (oHead["_getTextButton" + iButton]) {
			sText = oHead["_getTextButton" + iButton]();
		}

		return sText;
	};

	HeaderRenderer.getAdditionalTextButton = function (oHead, iButton) {
		var sText;

		if (oHead["getAdditionalTextButton" + iButton]) {
			sText = oHead["getAdditionalTextButton" + iButton]();
		} else if (oHead["_getAdditionalTextButton" + iButton]) {
			sText = oHead["_getAdditionalTextButton" + iButton]();
		}

		return sText;
	};

	HeaderRenderer._isTwoMonthsCalendar = function (oHead) {
		return (oHead.getParent() instanceof sap.ui.unified.Calendar && (oHead.getParent().getMonths() >= 2));
	};

	return HeaderRenderer;

}, /* bExport= */ true);