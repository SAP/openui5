/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/library', 'sap/ui/core/ValueStateSupport', 'sap/ui/Device'],
	function(coreLibrary, ValueStateSupport, Device) {
	"use strict";


	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	/**
	 * CheckBox renderer.
	 * @namespace
	 */
	var CheckBoxRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oCheckBox An object representation of the control that should be rendered
	 */
	CheckBoxRenderer.render = function(oRm, oCheckBox){
		// get control properties
		var sId = oCheckBox.getId(),
			bEnabled = oCheckBox.getEnabled(),
			bDisplayOnly = oCheckBox.getDisplayOnly(),
			bEditable = oCheckBox.getEditable(),
			bInteractive = bEnabled && !bDisplayOnly,
			bDisplayOnlyApplied = bEnabled && bDisplayOnly,
			oCbLabel = oCheckBox.getAggregation("_label"),
			sValueState = oCheckBox.getValueState(),
			bInErrorState = ValueState.Error === sValueState,
			bInWarningState = ValueState.Warning === sValueState,
			bInSuccessState = ValueState.Success === sValueState,
			bInInformationState = ValueState.Information === sValueState,
			bUseEntireWidth = oCheckBox.getUseEntireWidth();

		// CheckBox wrapper
		oRm.openStart("div", oCheckBox);
		oRm.class("sapMCb");

		if (!bEditable) {
			oRm.class("sapMCbRo");
		}

		if (bDisplayOnlyApplied) {
			oRm.class("sapMCbDisplayOnly");
		}

		if (!bEnabled) {
			oRm.class("sapMCbBgDis");
		}

		if (oCheckBox.getText()) {
			oRm.class("sapMCbHasLabel");
		}

		if (oCheckBox.getWrapping()) {
			oRm.class("sapMCbWrapped");
		}

		if (bInErrorState) {
			oRm.class("sapMCbErr");
		} else if (bInWarningState) {
			oRm.class("sapMCbWarn");
		} else if (bInSuccessState) {
			oRm.class("sapMCbSucc");
		} else if (bInInformationState) {
			oRm.class("sapMCbInfo");
		}

		if (bUseEntireWidth) {
			oRm.style("width", oCheckBox.getWidth());
		}

		var sTooltip = this.getTooltipText(oCheckBox);

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		if (bInteractive) {
			oRm.attr("tabindex", oCheckBox.getTabIndex());
		}

		//ARIA attributes
		oRm.accessibilityState(oCheckBox, {
			role: "checkbox",
			selected: null,
			checked: oCheckBox._getAriaChecked(),
			describedby: sTooltip ? sId + "-Descr" : undefined
		});

		if (bDisplayOnlyApplied) {
			oRm.attr("aria-readonly", true);
		}

		oRm.openEnd();		// DIV element

		// write the HTML into the render manager
		oRm.openStart("div", oCheckBox.getId() + "-CbBg");

		// CheckBox style class
		oRm.class("sapMCbBg");

		if (bInteractive && bEditable && Device.system.desktop) {
			oRm.class("sapMCbHoverable");
		}

		if (!oCheckBox.getActiveHandling()) {
			oRm.class("sapMCbActiveStateOff");
		}

		oRm.class("sapMCbMark"); // TODO: sapMCbMark is redundant, remove it and simplify CSS

		if (oCheckBox.getSelected()) {
			oRm.class("sapMCbMarkChecked");
		}

		if (oCheckBox.getPartiallySelected()) {
			oRm.class("sapMCbMarkPartiallyChecked");
		}

		oRm.openEnd();		// DIV element

		oRm.voidStart("input", oCheckBox.getId() + "-CB");
		oRm.attr("type", "CheckBox");

		if (oCheckBox.getSelected()) {
			oRm.attr("checked", "checked");
		}

		if (oCheckBox.getName()) {
			oRm.attr("name", oCheckBox.getName());
		}

		if (!bEnabled) {
			oRm.attr("disabled", "disabled");
		}

		if (!bEditable) {
			oRm.attr("readonly", "readonly");
		}

		oRm.voidEnd();
		oRm.close("div");
		oRm.renderControl(oCbLabel);

		if (sTooltip && sap.ui.getCore().getConfiguration().getAccessibility()) {
			// for ARIA, the tooltip must be in a separate SPAN and assigned via aria-describedby.
			// otherwise, JAWS does not read it.
			oRm.openStart("span", sId + "-Descr");
			oRm.class("sapUiHidden");
			oRm.openEnd();
			oRm.text(sTooltip);
			oRm.close("span");
		}

		oRm.close("div");
	};

	/**
	 * Returns the correct value of the tooltip.
	 *
	 * @param {sap.m.CheckBox} oCheckBox CheckBox instance
	 * @returns {string} The correct tooltip value
	 */
	CheckBoxRenderer.getTooltipText = function (oCheckBox) {
		var sValueStateText = oCheckBox.getProperty("valueStateText"),
			sTooltipText = oCheckBox.getTooltip_AsString();

		if (sValueStateText) {
			return (sTooltipText ? sTooltipText + " - " : "") + sValueStateText;
		} else {
			return ValueStateSupport.enrichTooltip(oCheckBox, sTooltipText);
		}
	};

	return CheckBoxRenderer;

}, /* bExport= */ true);
