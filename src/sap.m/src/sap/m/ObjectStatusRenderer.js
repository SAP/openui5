/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/i18n/Localization", "sap/ui/core/Lib", 'sap/ui/core/library', './library'], function(Localization, Library, coreLibrary, library) {
"use strict";


// shortcut for sap.ui.core.TextDirection
var TextDirection = coreLibrary.TextDirection;

// shortcut for sap.m.EmptyIndicator
var EmptyIndicatorMode = library.EmptyIndicatorMode;

// shortcut for library resource bundle
var oRb = Library.getResourceBundleFor("sap.m");


/**
 * ObjectStatus renderer.
 * @namespace
 */
var ObjectStatusRenderer = {
	apiVersion: 2
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.ObjectStatus} oObjStatus An object representation of the control that should be rendered
 */
ObjectStatusRenderer.render = function(oRm, oObjStatus){
	oRm.openStart("div", oObjStatus);

	if (oObjStatus._isEmpty() && oObjStatus.getEmptyIndicatorMode() === EmptyIndicatorMode.Off) {
		oRm.style("display", "none");
		oRm.openEnd();
	} else {

		var sState = oObjStatus.getState(),
			sStateText = oObjStatus._getStateText(sState),
			bInverted = oObjStatus.getInverted(),
			sTextDir = oObjStatus.getTextDirection(),
			bPageRTL = Localization.getRTL(),
			oAccAttributes = {},
			sTooltip = oObjStatus.getTooltip_AsString();

		if (sTextDir === TextDirection.Inherit) {
			sTextDir = bPageRTL ? TextDirection.RTL : TextDirection.LTR;
		}

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.class("sapMObjStatus");
		oRm.class("sapMObjStatus" + sState);
		if (bInverted) {
			oRm.class("sapMObjStatusInverted");
		}

		if (oObjStatus._isActive()) {
			oRm.class("sapMObjStatusActive");
			oRm.attr("tabindex", "0");
			oAccAttributes.role = "button";
			oAccAttributes.roledescription = Library.getResourceBundleFor("sap.m").getText("OBJECT_STATUS_ACTIVE");
		}

		var bTooltipAndAriaDescribedBy = sTooltip && oObjStatus.getAriaDescribedBy().length,
			sTooltipId;
		if (bTooltipAndAriaDescribedBy) {
			sTooltipId = oObjStatus.getId() + "-tooltip";
			oAccAttributes["describedby"] = { value: sTooltipId, append: true };
		}

		if (oObjStatus._hasExternalLabelling()) {
			oAccAttributes["labelledby"] = {
				value: oObjStatus._generateSelfLabellingIds(),
				append: true
			};
		}

		if (oObjStatus._isActive()) {
			oRm.accessibilityState(oObjStatus, oAccAttributes);
		}

		oRm.openEnd();

		if (bTooltipAndAriaDescribedBy) {
			oRm.openStart("span", sTooltipId);
			oRm.class("sapUiInvisibleText");
			oRm.openEnd();
			oRm.text(sTooltip);
			oRm.close("span");
		}

		if (oObjStatus.getTitle()) {

			oRm.openStart("span", oObjStatus.getId() + "-title");
			oRm.class("sapMObjStatusTitle");

			if (sTextDir) {
				oRm.attr("dir", sTextDir.toLowerCase());
			}

			oRm.attr("data-colon", Library.getResourceBundleFor("sap.m").getText("LABEL_COLON"));

			oRm.openEnd();
			oRm.text(oObjStatus.getTitle());
			oRm.close("span");
		}

		if (oObjStatus._isActive()) {
			oRm.openStart("span", oObjStatus.getId() + "-link");
			oRm.class("sapMObjStatusLink");
			oRm.openEnd();
		}

		oRm.openStart("span", oObjStatus.getId() + "-wrapper");
		oRm.class("sapMObjStatusWrapper");
		oRm.openEnd();

		if (oObjStatus.getIcon()) {
			oRm.openStart("span", oObjStatus.getId() + "-statusIcon");
			oRm.class("sapMObjStatusIcon");
			if (!oObjStatus.getText()) {
				oRm.class("sapMObjStatusIconOnly");
			}
			oRm.openEnd();
			oRm.renderControl(oObjStatus._getImageControl());
			oRm.close("span");
		}

		if (oObjStatus.getText()) {
			oRm.openStart("span", oObjStatus.getId() + "-text");
			oRm.class("sapMObjStatusText");

			if (sTextDir) {
				oRm.attr("dir", sTextDir.toLowerCase());
			}

			oRm.openEnd();
			oRm.text(oObjStatus.getText());
			oRm.close("span");
		} else if (oObjStatus.getEmptyIndicatorMode() !== EmptyIndicatorMode.Off && !oObjStatus.getText() && !oObjStatus.getIcon()) {
			this.renderEmptyIndicator(oRm, oObjStatus);
		}

		oRm.close("span");

		if (oObjStatus._isActive()) {
			oRm.close("span");
		} else {
			oRm.openStart("span", oObjStatus.getId() + "-role");
			oRm.class("sapUiPseudoInvisibleText");
			oRm.openEnd();
			oRm.text(Library.getResourceBundleFor("sap.m").getText("OBJECT_STATUS"));
			oRm.close("span");
		}

		if (sStateText) {
			oRm.openStart("span", oObjStatus.getId() + "-state-text");
			oRm.class("sapUiPseudoInvisibleText");
			oRm.openEnd();
			oRm.text(sStateText);
			oRm.close("span");
		}
	}

	oRm.close("div");
};

/**
 * Renders the empty text indicator.
 *
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
 * @param {sap.m.ObjectStatus} oOS An object representation of the control that should be rendered.
 */
ObjectStatusRenderer.renderEmptyIndicator = function(oRm, oOS) {
	oRm.openStart("span");
		oRm.class("sapMEmptyIndicator");
		if (oOS.getEmptyIndicatorMode() === EmptyIndicatorMode.Auto) {
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

return ObjectStatusRenderer;

});
