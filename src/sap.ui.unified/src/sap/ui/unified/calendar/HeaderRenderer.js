/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * Header renderer.
	 * @namespace
	 */
	var HeaderRenderer = {
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

		oRm.write("<div");
		oRm.writeControlData(oHead);
		oRm.addClass("sapUiCalHead");
		oRm.writeClasses();

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		oRm.writeAccessibilityState(oHead);

		oRm.write(">"); // div element

		oRm.write("<button");
		oRm.writeAttributeEscaped('id', sId + '-prev');
		oRm.writeAttributeEscaped("title", sLabelPrev);
		oRm.writeAccessibilityState(null, { label: sLabelPrev});

		oRm.addClass("sapUiCalHeadPrev");
		if (!oHead.getEnabledPrevious()) {
			oRm.addClass("sapUiCalDsbl");
			oRm.writeAttribute('disabled', "disabled");
		}
		oRm.writeAttribute('tabindex', "-1");
		oRm.writeClasses();
		oRm.write(">"); // button element
		oRm.writeIcon("sap-icon://slim-arrow-left", null, { title: null });
		oRm.write("</button>");

		var iFirst = -1;
		var iLast = -1;
		var i = 0;
		var iBtn;
		for (i = 0; i < 3; i++) {
			if (oHead["getVisibleButton" + i]()) {
				if (iFirst < 0) {
					iFirst = i;
				}
				iLast = i;
			}
		}

		for (i = 0; i < 3; i++) {
			// for Chinese and Japanese the date should be displayed in year, month, day order
			if (sLanguage.toLowerCase() === "ja" || sLanguage.toLowerCase() === "zh") {
				iBtn = 2 - i;
			} else {
				iBtn = i;
			}
			this.renderCalendarButtons(oRm, oHead, sId, iFirst, iLast, mAccProps, iBtn);
		}

		oRm.write("<button");
		oRm.writeAttributeEscaped('id', sId + '-next');
		oRm.writeAttributeEscaped("title", sLabelNext);
		oRm.writeAccessibilityState(null, { label: sLabelNext});

		oRm.addClass("sapUiCalHeadNext");
		if (!oHead.getEnabledNext()) {
			oRm.addClass("sapUiCalDsbl");
			oRm.writeAttribute('disabled', "disabled");
		}
		oRm.writeAttribute('tabindex', "-1");
		oRm.writeClasses();
		oRm.write(">"); // button element
		oRm.writeIcon("sap-icon://slim-arrow-right", null, { title: null });
		oRm.write("</button>");

		oRm.write("</div>");

	};

	HeaderRenderer.renderCalendarButtons = function (oRm, oHead, sId, iFirst, iLast, mAccProps, i) {
		if (oHead["getVisibleButton" + i]()) {
			oRm.write("<button");
			oRm.writeAttributeEscaped('id', sId + '-B' + i);
			oRm.addClass("sapUiCalHeadB");
			oRm.addClass("sapUiCalHeadB" + i);
			if (iFirst == i) {
				oRm.addClass("sapUiCalHeadBFirst");
			}
			if (iLast == i) {
				oRm.addClass("sapUiCalHeadBLast");
			}
			oRm.writeAttribute('tabindex', "-1");
			oRm.writeClasses();
			if (oHead["getAriaLabelButton" + i]()) {
				mAccProps["label"] = jQuery.sap.encodeHTML(oHead["getAriaLabelButton" + i]());
			}
			oRm.writeAccessibilityState(null, mAccProps);
			mAccProps = {};
			oRm.write(">"); // button element
			var sText = oHead["getTextButton" + i]() || "";
			var sAddText = oHead["getAdditionalTextButton" + i]() || "";
			if (sAddText) {
				oRm.write("<span");
				oRm.writeAttributeEscaped('id', sId + '-B' + i + "-Text");
				oRm.addClass("sapUiCalHeadBText");
				oRm.writeClasses();
				oRm.write(">"); // span element
				oRm.writeEscaped(sText);
				oRm.write("</span>");

				oRm.write("<span");
				oRm.writeAttributeEscaped('id', sId + '-B' + i + "-AddText");
				oRm.addClass("sapUiCalHeadBAddText");
				oRm.writeClasses();
				oRm.write(">"); // span element
				oRm.writeEscaped(sAddText);
				oRm.write("</span>");
			} else {
				oRm.writeEscaped(sText);
			}
			oRm.write("</button>");
		}
	};

	return HeaderRenderer;

}, /* bExport= */ true);
