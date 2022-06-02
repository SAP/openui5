/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/library', './library', 'sap/ui/core/Core'],
	function(Renderer, coreLibrary, library, Core) {
	"use strict";


	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	/**
	 * String to prefix CSS class for number status.
	 */
	var _sCSSPrefixObjNumberStatus = 'sapMObjectNumberStatus';

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = library.EmptyIndicatorMode;

	// shortcut for library resource bundle
	var oRb = Core.getLibraryResourceBundle("sap.m");

	/**
	 * ObjectNumber renderer.
	 * @namespace
	 */
	var ObjectNumberRenderer = {
			apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectNumber} oON An object representation of the control that should be rendered
	 */
	ObjectNumberRenderer.render = function(oRm, oON) {
		var sTooltip = oON.getTooltip_AsString(),
			sTextDir = oON.getTextDirection(),
			sTextAlign = oON.getTextAlign(),
			oAccAttributes = {};

		oRm.openStart("div", oON);
		oRm.class("sapMObjectNumber");

		if (oON._isActive()) {
			oRm.class("sapMObjectNumberActive");
			oRm.attr("tabindex", "0");
			oAccAttributes.role = "button";
		}

		oRm.class(_sCSSPrefixObjNumberStatus + oON.getState());

		if (oON.getEmphasized()) {
			oRm.class("sapMObjectNumberEmph");
		}

		if (oON.getInverted()) {
			oRm.class("sapMObjectNumberInverted");
		}

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		if (sTextDir !== TextDirection.Inherit) {
			oRm.attr("dir", sTextDir.toLowerCase());
		}

		sTextAlign = Renderer.getTextAlign(sTextAlign, sTextDir);

		if (sTextAlign) {
			oRm.style("text-align", sTextAlign);
		}

		if (oON._hasExternalLabelling()) {
			oAccAttributes["labelledby"] = {
				value: oON._generateSelfLabellingIds(),
				append: true
			};
		}

		oRm.accessibilityState(oON, oAccAttributes);

		oRm.openEnd();

		oRm.openStart("span", oON.getId() + "-inner");
		oRm.class("sapMObjectNumberInner");
		oRm.openEnd();

		if (oON.getEmptyIndicatorMode() !== EmptyIndicatorMode.Off && !oON.getNumber()) {
			this.renderEmptyIndicator(oRm, oON);
		} else {
			this.renderText(oRm, oON);
			this.renderUnit(oRm, oON);
		}

		oRm.close("span");

		this.renderEmphasizedInfoElement(oRm, oON);
		this.renderHiddenARIAElement(oRm, oON);
		this.renderRoleDescriptionInfo(oRm, oON);

		oRm.close("div");
	};

	ObjectNumberRenderer.renderText = function(oRm, oON) {
		var sUnit = oON.getUnit() || oON.getNumberUnit();
		oRm.openStart("span", oON.getId() + "-number");
		oRm.class("sapMObjectNumberText");
		oRm.openEnd();
		oRm.text(oON.getNumber());
		if (sUnit !== "") {
			oRm.text(" ");
		}
		oRm.close("span");
	};

	ObjectNumberRenderer.renderUnit = function(oRm, oON) {
		var sUnit = oON.getUnit() || oON.getNumberUnit();

		if (sUnit !== "") {
			oRm.openStart("span", oON.getId() + "-unit");
			oRm.class("sapMObjectNumberUnit");
			oRm.openEnd();
			oRm.text(sUnit);
			oRm.close("span");
		}
	};

	ObjectNumberRenderer.renderEmphasizedInfoElement = function(oRm, oON) {
		if (!oON.getEmphasized() || !oON.getNumber()) {
			return;
		}

		oRm.openStart("span", oON.getId() + "-emphasized");
		oRm.class("sapUiPseudoInvisibleText");
		oRm.openEnd();
		oRm.text(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("OBJECTNUMBER_EMPHASIZED"));
		oRm.close("span");
	};

	ObjectNumberRenderer.renderHiddenARIAElement = function(oRm, oON) {

		if (oON.getState() == ValueState.None) {
			return;
		}

		oRm.openStart("span", oON.getId() + "-state");
		oRm.class("sapUiPseudoInvisibleText");
		oRm.openEnd();
		oRm.text(oON._getStateText());
		oRm.close("span");
	};

	ObjectNumberRenderer.renderRoleDescriptionInfo = function(oRm, oON) {
		oRm.openStart("span", oON.getId() + "-roledescription");
		oRm.class("sapUiPseudoInvisibleText");
		oRm.openEnd();
		oRm.text(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("OBJECTNUMBER_NAME"));
		oRm.close("span");
	};

	/**
	 * Renders the empty text indicator.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.ObjectNumberRenderer} oON An object representation of the control that should be rendered.
	 */
	ObjectNumberRenderer.renderEmptyIndicator = function(oRm, oON) {
		oRm.openStart("span");
			oRm.class("sapMEmptyIndicator");
			if (oON.getEmptyIndicatorMode() === EmptyIndicatorMode.Auto) {
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

	return ObjectNumberRenderer;

}, /* bExport= */ true);
