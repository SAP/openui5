/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/ui/core/Lib"
], function(library, coreLibrary, oCore, Lib) {
	"use strict";
	//shortcut for sap.m.GenericTagDesign
	var GenericTagDesign = library.GenericTagDesign,

		//shortcut for sap.m.GenericTagValueState
		GenericTagValueState = library.GenericTagValueState,

		//shortcut for sap.ui.core.ValueState
		ValueState = coreLibrary.ValueState,
		GenericTagRenderer = {
			apiVersion: 2
		};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.GenericTag} oControl the control to be rendered
	 */

	GenericTagRenderer.render = function(oRm, oControl) {
		var aLabelledBy = this._getAriaLabelledBy(oControl),
			oResourceBundle = Lib.getResourceBundleFor("sap.m"),
			sTooltip = oControl.getTooltip_AsString();

		oRm.openStart("div", oControl);
		oRm.class("sapMGenericTag");
		oRm.attr("tabindex", 0);

		oRm.class("sapMGenericTag" + oControl.getStatus());

		oRm.accessibilityState(oControl, {
			role: "button",
			roledescription: oResourceBundle.getText("GENERICTAG_ROLEDESCRIPTION"),
			labelledby: aLabelledBy.join(" ")
		});

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.openEnd();

		oRm.openStart("div");
		oRm.class("sapMGenericTagWrap");
		oRm.openEnd();

		this.renderElements(oRm, oControl);

		oRm.close("div");
		oRm.close("div");
	};

	GenericTagRenderer.renderElements = function (oRm, oControl) {
		var bStatusIconHidden = oControl.getDesign() === GenericTagDesign.StatusIconHidden,
			bShouldRenderErrorIcon = oControl.getValueState() === GenericTagValueState.Error,
			oValue =  oControl.getValue();

		if (!bStatusIconHidden && oControl.getStatus() !== ValueState.None) {
			oRm.renderControl(oControl._getStatusIcon());
		}

		this.renderText(oRm, oControl);

		if (bShouldRenderErrorIcon) {
			oRm.renderControl(oControl._getErrorIcon());
		} else if (oValue) {
			oRm.renderControl(oValue.addStyleClass("sapMGenericTagValue"));
		}

		this.renderHiddenARIAElement(oRm, oControl);
	};

	GenericTagRenderer.renderText = function (oRm, oControl) {
		oRm.openStart("span", oControl.getId() + "-text");
		oRm.class("sapMGenericTagText");
		oRm.openEnd();
		oRm.text(oControl.getText());
		oRm.close("span");
	};

	GenericTagRenderer.renderHiddenARIAElement = function(oRm, oControl) {

		if (oControl.getStatus() === ValueState.None) {
			return;
		}

		oRm.openStart("span", oControl.getId() + "-status");
		oRm.class("sapUiInvisibleText");
		oRm.attr("aria-hidden", "true");
		oRm.openEnd();

		oRm.text(this._getGenericTagStatusText(oControl));

		oRm.close("span");
	};

	GenericTagRenderer._getAriaLabelledBy = function(oControl) {
		var aLabelledBy = oControl.getAriaLabelledBy().slice(),
			sId = oControl.getId(),
			sTagValueId = this._getTagValueId(oControl),
			sTagValueState = this._getTagValueState(oControl),
			sStatus = oControl.getStatus();

		if (sStatus !== ValueState.None && sStatus !== sTagValueState) {
			aLabelledBy.push(sId + "-status");
		}

		aLabelledBy.push(sId + "-text");

		aLabelledBy.push(
			oControl.getValueState() === GenericTagValueState.Error ? sId + "-errorIcon" : sTagValueId
		);

		return aLabelledBy;
	};

	GenericTagRenderer._getGenericTagStatusText = function(oControl) {
		var oResourceBundle = Lib.getResourceBundleFor("sap.m"),
			sARIAStatusText;

		switch (oControl.getStatus()) {
			case ValueState.Error:
				sARIAStatusText = oResourceBundle.getText("GENERICTAG_ARIA_VALUE_STATE_ERROR");
				break;
			case ValueState.Warning:
				sARIAStatusText = oResourceBundle.getText("GENERICTAG_ARIA_VALUE_STATE_WARNING");
				break;
			case ValueState.Success:
				sARIAStatusText = oResourceBundle.getText("GENERICTAG_ARIA_VALUE_STATE_SUCCESS");
				break;
			case ValueState.Information:
				sARIAStatusText = oResourceBundle.getText("GENERICTAG_ARIA_VALUE_STATE_INFORMATION");
				break;
			default:
				// No aria status text
		}

		return sARIAStatusText;
	};

	GenericTagRenderer._getTagValueId = function(oControl) {
		var oValue = oControl.getValue();

		return oValue ? oValue.getId() : "";
	};

	GenericTagRenderer._getTagValueState = function(oControl) {
		var oValue = oControl.getValue();

		return oValue ? oValue.getState() : "";
	};

	return GenericTagRenderer;

}, /* bExport= */true);