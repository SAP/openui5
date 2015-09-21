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

		var sTooltip = oHead.getTooltip_AsString();
		var sId = oHead.getId();
		var mAccProps = {};

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
		oRm.writeAttribute('id', sId + '-prev');
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

		oRm.write("<button");
		oRm.writeAttribute('id', sId + '-B1');
		oRm.addClass("sapUiCalHeadB");
		oRm.addClass("sapUiCalHeadB1");
		oRm.writeAttribute('tabindex', "-1");
		oRm.writeClasses();
		if (oHead.getAriaLabelButton1()) {
			mAccProps["label"] = jQuery.sap.encodeHTML(oHead.getAriaLabelButton1());
		}
		oRm.writeAccessibilityState(null, mAccProps);
		mAccProps = {};
		oRm.write(">"); // button element
		oRm.writeEscaped(oHead.getTextButton1() || "");
		oRm.write("</button>");

		oRm.write("<button");
		oRm.writeAttribute('id', sId + '-B2');
		oRm.addClass("sapUiCalHeadB");
		oRm.addClass("sapUiCalHeadB2");
		oRm.writeAttribute('tabindex', "-1");
		oRm.writeClasses();
		if (oHead.getAriaLabelButton2()) {
			mAccProps["label"] = jQuery.sap.encodeHTML(oHead.getAriaLabelButton2());
		}
		oRm.writeAccessibilityState(null, mAccProps);
		oRm.write(">"); // button element
		oRm.writeEscaped(oHead.getTextButton2() || "");
		oRm.write("</button>");

		oRm.write("<button");
		oRm.writeAttribute('id', sId + '-next');
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

	return HeaderRenderer;

}, /* bExport= */ true);
