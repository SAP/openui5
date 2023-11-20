/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.CheckBox
sap.ui.define(['sap/ui/core/ValueStateSupport', 'sap/ui/core/library'],
	function(ValueStateSupport, coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.AccessibleRole
	var AccessibleRole = coreLibrary.AccessibleRole;


	/**
	 * @author SAP SE
	 * @namespace
	 */
	var CheckBoxRenderer = {
	};

	/**
	 * Renders the HTML for the CheckBox, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that is used for writing to the render output buffer.
	 * @param {sap.ui.commons.CheckBox} oCheckBox The CheckBox control that should be rendered.
	 */
	CheckBoxRenderer.render = function(rm, oCheckBox) {
		rm.addClass("sapUiCb");

		// Open the containing <span> tag
		rm.write("<span");
		rm.writeControlData(oCheckBox);

		// ARIA
		rm.writeAccessibilityState(oCheckBox, {"role" : AccessibleRole.Checkbox.toLowerCase()});
		rm.writeAttributeEscaped("aria-labelledby", oCheckBox.getId() + "-label");

		// Collect state information
		var enabled = oCheckBox.getEnabled() != null && oCheckBox.getEnabled();
		var editable = oCheckBox.getEditable() != null && oCheckBox.getEditable();
		var inErrorState = false;
		var inWarningState = false;
		if (oCheckBox.getValueState() != null) {
			inErrorState = ValueState.Error == oCheckBox.getValueState();
			inWarningState = ValueState.Warning == oCheckBox.getValueState();
		}

		// Add classes and properties depending on the state
		if (oCheckBox.getChecked()) {
			rm.addClass("sapUiCbChk");
		}

		var myTabIndex = 0;

		if (!editable) {
			rm.addClass("sapUiCbRo");
			// According to CSN 2581852 2012 a readonly CB should be in the tabchain
			// This changed in 2013 back to not in the tabchain: see CSN 0002937527 2013
			// Let's see how often this will be changed back and forth in the future... Accessibility fun! :-D
			// End of 2013 is have to be again in the tabchain.
			// But not in the Form. But this is handled in the FormLayout control
			// Let's see what happens 2014... ;-)
			myTabIndex = 0;
		}
		if (!enabled) {
			rm.addClass("sapUiCbDis");
			myTabIndex = -1;
		}
		if (inErrorState) {
			rm.addClass("sapUiCbErr");
			rm.writeAttribute("aria-invalid", "true");
		} else if (inWarningState) {
			rm.addClass("sapUiCbWarn");
		}
		if (enabled && editable && !inErrorState && !inWarningState) {
			rm.addClass("sapUiCbStd");
		}
		if (enabled && editable) {
			rm.addClass("sapUiCbInteractive");
		}
		rm.writeClasses();

		if (oCheckBox.getWidth() && oCheckBox.getWidth() != '') {
			rm.writeAttribute("style", "width:" + oCheckBox.getWidth() + ";");
		}

		rm.writeAttribute("tabindex", myTabIndex);

		rm.write(">"); // close the containing <span> tag


		// Write the (potentially hidden) HTML checkbox element
		rm.write("<input type='CheckBox' tabindex='-1' id='");
		rm.write(oCheckBox.getId());
		rm.write("-CB'");

		if (oCheckBox.getName()) {
			rm.writeAttributeEscaped('name', oCheckBox.getName());
		}

		if (oCheckBox.getChecked()) {
			rm.write(" checked='checked'");
		}
		if (!enabled) {
			rm.write(" disabled='disabled'");
		}
		var tooltip = ValueStateSupport.enrichTooltip(oCheckBox, oCheckBox.getTooltip_AsString());
		if (tooltip) {
			rm.writeAttributeEscaped("title", tooltip);
		}
		if (!editable) {
			//'readonly' property is not supported by input type=checkbox
			//In order to make readonly checkbox unresponsive, we need to apply 'disabled' property - only affects HCB theme
			rm.write(" disabled='disabled'");
		}
		rm.write(">"); // close checkbox-input-element


		// Write the checkbox label which also holds the background image
		rm.write("<label");
		rm.writeAttributeEscaped("id", oCheckBox.getId() + "-label");

		if (tooltip) {
			rm.writeAttributeEscaped("title", tooltip);
		}
		rm.writeAttribute("for", oCheckBox.getId() + "-CB"); // label for checkbox, so clicks toggle the state
		if (!oCheckBox.getText()) {
			rm.write(" class='sapUiCbNoText'");
		}
		rm.write(">");
		if (oCheckBox.getText()) {
			this.renderText(rm, oCheckBox.getText(), oCheckBox.getTextDirection());
		}
		rm.write("</label>");

		// close the surrounding <span> element
		rm.write("</span>");
	};



	/**
	 * Write the CheckBox label either flat or - in case the text direction is different from the environment - within a span tag with an explicit "dir".
	 */
	CheckBoxRenderer.renderText = function(rm, sText, eTextDirection) {
		if (!eTextDirection || eTextDirection == TextDirection.Inherit) {
			rm.writeEscaped(sText);
		} else {
			rm.write("<span style=\"direction:" + eTextDirection.toLowerCase() + ";\">");
			rm.writeEscaped(sText);
			rm.write("</span>");
		}
	};


	return CheckBoxRenderer;

}, /* bExport= */ true);
