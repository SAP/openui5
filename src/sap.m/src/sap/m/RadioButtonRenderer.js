/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/ValueStateSupport",
	"sap/ui/core/library",
	"sap/ui/Device"
], function (Core, ValueStateSupport, coreLibrary, Device) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * RadioButton renderer.
	 * @namespace
	 */
	var RadioButtonRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oRadioButton an object representation of the control that should be rendered
	 */
	RadioButtonRenderer.render = function (oRM, oRadioButton) {
		this.addWOuterDivStyles(oRM, oRadioButton);
		this.addInnerDivStyles(oRM, oRadioButton);

		this.renderSvg(oRM, oRadioButton);
		this.renderInput(oRM, oRadioButton);

		this.closeDiv(oRM);

		oRM.renderControl(oRadioButton._oLabel);

		this.renderTooltip(oRM, oRadioButton);

		this.closeDiv(oRM);
	};

	RadioButtonRenderer.addWOuterDivStyles = function (oRM, oRadioButton) {
		var sId = oRadioButton.getId(),
			bEnabled = oRadioButton.getEnabled(),
			bNonEditableParent = !oRadioButton.getProperty("editableParent"),
			bNonEditable = !oRadioButton.getEditable() || bNonEditableParent,
			oValueState = oRadioButton.getValueState();

		oRM.openStart("div", oRadioButton)
			.class("sapMRb");

		if (oRadioButton.getUseEntireWidth()) {
			oRM.style("width", oRadioButton.getWidth());
		}

		var sTooltipWithStateMessage = this.getTooltipText(oRadioButton);
		if (sTooltipWithStateMessage) {
			oRM.attr("title", sTooltipWithStateMessage);
		}

		oRM.accessibilityState(oRadioButton, {
			role: "radio",
			readonly: null,
			selected: null, // Avoid output aria-selected
			checked: oRadioButton.getSelected(), // aria-checked must be set explicitly
			disabled: bNonEditable ? true : undefined, // Avoid output aria-disabled=false when the button is editable
			invalid: oValueState === ValueState.Error ? true : null,
			labelledby: { value: sId + "-label", append: true },
			describedby: { value: (sTooltipWithStateMessage ? sId + "-Descr" : undefined), append: true }
		});

		if (oRadioButton.getSelected()) {
			oRM.class("sapMRbSel");
		}

		if (!bEnabled) {
			oRM.class("sapMRbDis");
		}

		if (bNonEditable) {
			oRM.class("sapMRbRo");
		}

		if (oValueState === ValueState.Error) {
			oRM.class("sapMRbErr");
		}

		if (oValueState === ValueState.Warning) {
			oRM.class("sapMRbWarn");
		}

		if (oValueState === ValueState.Success) {
			oRM.class("sapMRbSucc");
		}

		if (oValueState === ValueState.Information) {
			oRM.class("sapMRbInfo");
		}

		if (bEnabled) {
			oRM.attr("tabindex", oRadioButton.hasOwnProperty("_iTabIndex") ? oRadioButton._iTabIndex : 0);
		}

		oRM.openEnd();
	};

	RadioButtonRenderer.addInnerDivStyles = function (oRM, oRadioButton) {
		oRM.openStart("div")
			.class("sapMRbB");

		if (!this.isButtonReadOnly(oRadioButton) && Device.system.desktop) {
			oRM.class("sapMRbHoverable");
		}

		oRM.openEnd();
	};

	RadioButtonRenderer.renderSvg = function(oRM, oRadioButton) {
		oRM.openStart("svg")
			.attr("xmlns", "http://www.w3.org/2000/svg").attr("version", "1.0")
			.accessibilityState({ role: "presentation" })
			.class("sapMRbSvg")
			.openEnd();

		//set an id on this this to be able to focus it, on ApplyFocusInfo (rerenderAllUiAreas)
		oRM.openStart("circle", oRadioButton.getId() + "-Button")
			.attr("stroke", "black")
			.attr("r", "50%")
			.attr("stroke-width", "2")
			.attr("fill", "none")
			.class("sapMRbBOut")
			.openEnd().close("circle");


		oRM.openStart("circle")
			.attr("r", "22%")
			.attr("stroke-width", "10")
			.class("sapMRbBInn")
			.openEnd().close("circle");

		oRM.close("svg");
	};

	RadioButtonRenderer.renderInput = function (oRM, oRadioButton) {
		// Write the real - potentially hidden - HTML RadioButton element
		oRM.voidStart("input", oRadioButton.getId() + "-RB")
			.attr("type", "radio")
			.attr("tabindex", "-1")
			.attr("name", oRadioButton.getGroupName());

		if (oRadioButton.getSelected()) {
			oRM.attr("checked", "checked");
		}

		if (this.isButtonReadOnly(oRadioButton)) {
			oRM.attr("readonly", "readonly");
			oRM.attr("disabled", "disabled");
		}

		oRM.voidEnd();
	};

	RadioButtonRenderer.renderTooltip = function (oRM, oRadioButton) {
		var sTooltipWithStateMessage = this.getTooltipText(oRadioButton);

		if (sTooltipWithStateMessage && Core.getConfiguration().getAccessibility()) {
			// for ARIA, the tooltip must be in a separate SPAN and assigned via aria-describedby.
			// otherwise, JAWS does not read it.
			oRM.openStart("span", oRadioButton.getId() + "-Descr")
				.style("display", "none")
				.openEnd()
				.text(sTooltipWithStateMessage)
				.close("span");
		}
	};

	RadioButtonRenderer.isButtonReadOnly = function(oRadioButton) {
		var bEnabled = oRadioButton.getEnabled(),
			bNonEditableParent = !oRadioButton.getProperty("editableParent"),
			bNonEditable = !oRadioButton.getEditable() || bNonEditableParent;

		return !bEnabled || bNonEditable;

	};

	RadioButtonRenderer.closeDiv = function (oRM) {
		oRM.close("div");
	};

	/**
	 * Returns the correct value of the tooltip.
	 *
	 * @param {sap.m.RadioButton} oRadioButton RadioButton instance.
	 * @returns {string} The correct tooltip value.
	 */
	RadioButtonRenderer.getTooltipText = function (oRadioButton) {
		var sValueStateText = oRadioButton.getProperty("valueStateText"),
			sTooltipText = oRadioButton.getTooltip_AsString();

		if (sValueStateText) {
			return (sTooltipText ? sTooltipText + " - " : "") + sValueStateText;
		} else {
			return ValueStateSupport.enrichTooltip(oRadioButton, sTooltipText);
		}
	};

	return RadioButtonRenderer;
}, /* bExport= */ true);