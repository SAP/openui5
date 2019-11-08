/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/ValueStateSupport', 'sap/ui/core/library', 'sap/ui/Device'],
	function(ValueStateSupport, coreLibrary, Device) {
	"use strict";


	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	/**
	 * RadioButton renderer.
	 * @namespace
	 */
	var RadioButtonRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oRadioButton an object representation of the control that should be rendered
	 */
	RadioButtonRenderer.render = function(oRm, oRadioButton) {

		this.addWOuterDivStyles(oRm, oRadioButton);
		this.addInnerDivStyles(oRm, oRadioButton);

		this.renderSvg(oRm, oRadioButton);
		this.renderInput(oRm, oRadioButton);

		this.closeDiv(oRm);
		oRm.renderControl(oRadioButton._oLabel);

		this.renderTooltip(oRm, oRadioButton);
		this.closeDiv(oRm);
	};

	RadioButtonRenderer.addWOuterDivStyles = function(oRm, oRadioButton) {
		var sId = oRadioButton.getId(),
			bEnabled = oRadioButton.getEnabled(),
			bNonEditableParent = !oRadioButton.getProperty("editableParent"),
			bNonEditable = !oRadioButton.getEditable() || bNonEditableParent,
			bInErrorState = ValueState.Error === oRadioButton.getValueState(),
			bInWarningState = ValueState.Warning === oRadioButton.getValueState(),
			bInSuccessState = ValueState.Success === oRadioButton.getValueState(),
			bInInformationState = ValueState.Information === oRadioButton.getValueState(),
			bUseEntireWidth = oRadioButton.getUseEntireWidth();

		// Radio Button style class
		oRm.addClass("sapMRb");

		// write the HTML into the render manager
		oRm.write("<div"); // Control - DIV
		oRm.writeControlData(oRadioButton);

		if (bUseEntireWidth) {
			oRm.addStyle("width", oRadioButton.getWidth());
			oRm.writeStyles();
		}

		var sTooltipWithStateMessage = this.getTooltipText(oRadioButton);
		if (sTooltipWithStateMessage) {
			oRm.writeAttributeEscaped("title", sTooltipWithStateMessage);
		}

		// ARIA
		oRm.writeAccessibilityState(oRadioButton, {
			role: "radio",
			readonly: null,
			selected: null, // Avoid output aria-selected
			checked: oRadioButton.getSelected(), // aria-checked must be set explicitly
			disabled: bNonEditable ? true : undefined, // Avoid output aria-disabled=false when the button is editable
			labelledby: { value: sId + "-label", append: true },
			describedby: { value: (sTooltipWithStateMessage ? sId + "-Descr" : undefined), append: true }
		});

		// Add classes and properties depending on the state
		if (oRadioButton.getSelected()) {
			oRm.addClass("sapMRbSel");
		}

		if (!bEnabled) {
			oRm.addClass("sapMRbDis");
		}

		if (bNonEditable) {
			oRm.addClass("sapMRbRo");
		}

		if (bInErrorState) {
			oRm.addClass("sapMRbErr");
		}

		if (bInWarningState) {
			oRm.addClass("sapMRbWarn");
		}

		if (bInSuccessState) {
			oRm.addClass("sapMRbSucc");
		}

		if (bInInformationState) {
			oRm.addClass("sapMRbInfo");
		}

		oRm.writeClasses();

		if (bEnabled) {
			oRm.writeAttribute("tabindex", oRadioButton.hasOwnProperty("_iTabIndex") ? oRadioButton._iTabIndex : 0);
		}

		oRm.write(">"); // DIV element
	};

	RadioButtonRenderer.addInnerDivStyles = function(oRm, oRadioButton) {
		var bReadOnly = this.isButtonReadOnly(oRadioButton);

		oRm.write("<div ");
		oRm.addClass('sapMRbB');

		if (!bReadOnly && Device.system.desktop) {
			oRm.addClass('sapMRbHoverable');
		}

		oRm.writeClasses();
		oRm.write(">");
	};

	RadioButtonRenderer.renderSvg = function(oRm, oRadioButton) {
		var sId = oRadioButton.getId();

		oRm.write("<svg xmlns='http://www.w3.org/2000/svg' version='1.0'");
		oRm.addClass('sapMRbSvg');
		oRm.writeClasses();
		oRm.writeAttribute("role", "presentation");
		oRm.write(">");

		oRm.write('<circle stroke="black" r="50%" stroke-width="2" fill="none"');
		oRm.addClass("sapMRbBOut");

		//set an id on this this to be able to focus it, on ApplyFocusInfo (rerenderAllUiAreas)
		oRm.writeAttribute("id", sId + "-Button");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</circle>");

		oRm.write('<circle r="22%" stroke-width="10"');
		oRm.addClass("sapMRbBInn");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</circle>");

		oRm.write("</svg>");
	};

	RadioButtonRenderer.renderInput = function (oRm, oRadioButton) {
		var sId = oRadioButton.getId(),
			bReadOnly = this.isButtonReadOnly(oRadioButton);

		// Write the real - potentially hidden - HTML RadioButton element
		oRm.write("<input type='radio' tabindex='-1'");
		oRm.writeAttribute("id", sId + "-RB");
		oRm.writeAttributeEscaped("name", oRadioButton.getGroupName());
		if (oRadioButton.getSelected()) {
			oRm.writeAttribute("checked", "checked");
		}

		if (bReadOnly) {
			oRm.writeAttribute("readonly", "readonly");
			oRm.writeAttribute("disabled", "disabled");
		}

		oRm.write(" />"); // Close RadioButton-input-element
	};

	RadioButtonRenderer.renderTooltip = function (oRm, oRadioButton) {
		var sId = oRadioButton.getId(),
			sTooltipWithStateMessage = this.getTooltipText(oRadioButton);

		if (sTooltipWithStateMessage && sap.ui.getCore().getConfiguration().getAccessibility()) {
			// for ARIA, the tooltip must be in a separate SPAN and assigned via aria-describedby.
			// otherwise, JAWS does not read it.
			oRm.write("<span id=\"" + sId + "-Descr\" style=\"display: none;\">");
			oRm.writeEscaped(sTooltipWithStateMessage);
			oRm.write("</span>");
		}
	};

	RadioButtonRenderer.isButtonReadOnly = function(oRadioButton) {

		var bEnabled = oRadioButton.getEnabled(),
			bNonEditableParent = !oRadioButton.getProperty("editableParent"),
			bNonEditable = !oRadioButton.getEditable() || bNonEditableParent;

		return !bEnabled || bNonEditable;

	};

	RadioButtonRenderer.closeDiv = function (oRm) {
		oRm.write("</div>");
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
