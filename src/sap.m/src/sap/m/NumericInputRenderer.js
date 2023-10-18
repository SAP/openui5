/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./InputRenderer", "sap/ui/Device", "sap/ui/core/LabelEnablement", "sap/ui/core/Configuration"],
	function(Renderer, InputRenderer, Device, LabelEnablement, Configuration) {
	"use strict";

	/**
	* NumericInput renderer.
	*
	* NumericInputRenderer extends the InputRenderer.
	*
	* @namespace
	*/
	var NumericInputRenderer = Renderer.extend(InputRenderer);
	NumericInputRenderer.apiVersion = 2;

	NumericInputRenderer.writeInnerAttributes = function(oRm, oControl) {
		var oStepInput = oControl.getParent(),
			mAccAttributes = this.getAccessibilityState(oControl);

		oRm.attr("type", Device.system.desktop ? "text" : "number");

		// inside the Input this function also sets explicitly textAlign to "End" if the type
		// of the Input is Numeric (our case)
		// so we have to overwrite it by leaving only the text direction
		// and the textAlign will be controlled by textAlign property of the StepInput

		if (Configuration.getRTL()) {
			oRm.attr("dir", "ltr");
		}
		// prevent rendering of aria-disabled attribute to avoid having
		// both aria-disabled and disabled at the same time
		mAccAttributes.disabled = null;

		if (NumericInputRenderer._isStepInput(oStepInput)) {
			oRm.accessibilityState(oStepInput, mAccAttributes);
		}
	};

	/**
	 * Returns aria accessibility role for the control.
	 *
	 * @protected
	 * @override
	 * @param {sap.m.Input} oControl An object representation of the control
	 * @returns {string}
	 */
	 NumericInputRenderer.getAriaRole = function (oControl) {
		return "spinbutton";
	};

	//Accessibility behavior of the Input needs to be extended
	/**
	* Overwrites the accessibility state using the <code>getAccessibilityState</code> method of the <code>InputBaseRenderer</code>.
	*
	* @param {NumericInput} oNumericInput The numeric input instance
	* @returns {Array} mAccessibilityState
	*/
	NumericInputRenderer.getAccessibilityState = function(oNumericInput) {
		var mAccessibilityState = InputRenderer.getAccessibilityState.apply(this, arguments),
			fMin,
			fMax,
			fNow,
			sDescription,
			sDescriptionLabel,
			aAriaLabelledByRefs,
			aReferencingLabels,
			sDescribedBy,
			sResultingLabelledBy,
			oStepInput = oNumericInput.getParent(),
			sValue = oNumericInput.getValue();

		if (!NumericInputRenderer._isStepInput(oStepInput)) {
			return mAccessibilityState;
		}

		fMin = oStepInput._getMin();
		fMax = oStepInput._getMax();
		fNow = oStepInput.getValue();
		sDescription = oStepInput.getDescription();
		aAriaLabelledByRefs = oStepInput.getAriaLabelledBy();
		// If we don't check this manually, we won't have the labels, which were referencing SI,
		// in aria-labelledby (which normally comes out of the box). This is because writeAccessibilityState
		// is called for NumericInput, while any labels will be for the parent StepInput.
		aReferencingLabels = LabelEnablement.getReferencingLabels(oStepInput);
		sDescribedBy = oStepInput.getAriaDescribedBy().join(" ");

		mAccessibilityState.valuenow = fNow;

		if (Device.system.desktop && sValue) {
			mAccessibilityState.valuetext = sValue;
		}

		if (sDescription) {
			// If there is a description, we should add a reference to it in the aria-labelledby
			sDescriptionLabel = oStepInput._getInput().getId() + "-descr";
			if (aAriaLabelledByRefs.indexOf(sDescriptionLabel) === -1) {
				aAriaLabelledByRefs.push(sDescriptionLabel);
			}
		}

		sResultingLabelledBy = aReferencingLabels.concat(aAriaLabelledByRefs).join(" ");

		if (typeof fMin === "number") {
			mAccessibilityState.valuemin = fMin;
		}

		if (typeof fMax === "number") {
			mAccessibilityState.valuemax = fMax;
		}

		if (!oStepInput.getEditable()) {
			mAccessibilityState.readonly = true;
		}

		if (sDescribedBy) {
			mAccessibilityState.describedby = sDescribedBy;
		}

		if (sResultingLabelledBy) {
			mAccessibilityState.labelledby = sResultingLabelledBy;
		}

		return mAccessibilityState;
	};

	NumericInputRenderer._isStepInput = function(oControl) {
		return oControl && oControl.getMetadata().getName() === "sap.m.StepInput";
	};

	return NumericInputRenderer;
});