/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/library"
], function(library, coreLibrary) {
	"use strict";
	//shortcut for sap.m.GenericTagDesign
	var GenericTagDesign = library.GenericTagDesign,

		//shortcut for sap.m.GenericTagValueState
		GenericTagValueState = library.GenericTagValueState,

		//shortcut for sap.ui.core.ValueState
		ValueState = coreLibrary.ValueState,
		oCore = sap.ui.getCore(),
		GenericTagRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.GenericTag} oControl the control to be rendered
	 */

	GenericTagRenderer.render = function(oRm, oControl) {
		var aLabelledBy = this._getAriaLabelledBy(oControl),
			oResourceBundle = oCore.getLibraryResourceBundle("sap.m");

		oRm.openStart("div");
		oRm.class("sapMGenericTag");
		oRm.attr("id", oControl.getId());
		oRm.attr("tabindex", 0);
		oRm.controlData(oControl);

		oRm.class("sapMGenericTag" + oControl.getStatus());

		oRm.accessibilityState(oControl, {
			role: "button",
			roledescription: oResourceBundle.getText("GENERICTAG_ROLEDESCRIPTION"),
			labelledBy: aLabelledBy.join(" ")
		});

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
		oRm.openStart("span");
		oRm.class("sapMGenericTagText");
		oRm.attr("id", oControl.getId() + "-text");
		oRm.openEnd();
		oRm.text(oControl.getText());
		oRm.close("span");
	};

	GenericTagRenderer.renderHiddenARIAElement = function(oRm, oControl) {

		if (oControl.getStatus() === ValueState.None) {
			return;
		}

		oRm.openStart("span");
		oRm.class("sapUiInvisibleText");
		oRm.attr("id", oControl.getId() + "-status");
		oRm.attr("aria-hidden", "true");
		oRm.openEnd();

		oRm.write(this._getGenericTagStatusText(oControl));

		oRm.close("span");
	};

	GenericTagRenderer._getAriaLabelledBy = function(oControl) {
		var aLabelledBy = [],
			sId = oControl.getId();

		if (oControl.getStatus() !== ValueState.None) {
			aLabelledBy.push(sId + "-status");
		}

		aLabelledBy.push(sId + "-text");

		aLabelledBy.push(
			oControl.getValueState() === GenericTagValueState.Error ? sId + "-errorIcon" : this._getTagValueId(oControl)
		);

		return aLabelledBy;
	};

	GenericTagRenderer._getGenericTagStatusText = function(oControl) {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sRoleDescription = oResourceBundle.getText("GENERICTAG_ROLEDESCRIPTION"),
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

		return sRoleDescription + " " + sARIAStatusText;
	};

	GenericTagRenderer._getTagValueId = function(oControl) {
		var oValue = oControl.getValue();

		return oValue ? oValue.getId() : "";
	};

	return GenericTagRenderer;

}, /* bExport= */true);