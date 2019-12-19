/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/InvisibleText', 'sap/ui/core/Renderer', './InputBaseRenderer', 'sap/m/library'],
	function(InvisibleText, Renderer, InputBaseRenderer, library) {
	"use strict";


	// shortcut for sap.m.InputType
	var InputType = library.InputType;


	/**
	 * Input renderer.
	 * @namespace
	 *
	 * InputRenderer extends the InputBaseRenderer
	 */
	var InputRenderer = Renderer.extend(InputBaseRenderer);
	InputRenderer.apiVersion = 2;

	/**
	 * Adds control specific class
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.addOuterClasses = function (oRm, oControl) {
		oRm.class("sapMInput");

		if (oControl.getDescription()) {
			oRm.class("sapMInputWithDescription");
		}
	};

	/**
	 * add extra attributes to Input
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.writeInnerAttributes = function (oRm, oControl) {
		oRm.attr("type", oControl.getType().toLowerCase());
		//if Input is of type "Number" step attribute should be "any" allowing input of floating point numbers
		if (oControl.getType() == InputType.Number) {
			oRm.attr("step", "any");
		}
		if (oControl.getType() == InputType.Number && sap.ui.getCore().getConfiguration().getRTL()) {
			oRm.attr("dir", "ltr").style("text-align", "right");
		}

		if (oControl.getShowSuggestion() || oControl.getShowValueStateMessage()) {
			oRm.attr("autocomplete", "off"); // autocomplete="off" needed so the native browser autocomplete is not shown?
		}

		if ((!oControl.getEnabled() && oControl.getType() == "Password")
			|| (oControl.getShowSuggestion() && oControl._bUseDialog)
			|| (oControl.getValueHelpOnly() && oControl.getEnabled() && oControl.getEditable() && oControl.getShowValueHelp())) {
			// required for JAWS reader on password fields on desktop and in other cases:
			oRm.attr("readonly", "readonly");
		}
	};

	/**
	 * Adds inner css classes to the input field
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.addInnerClasses = function (oRm, oControl) {
	};

	InputRenderer.writeDescription = function (oRm, oControl) {
		oRm.openStart("div")
			.class("sapMInputDescriptionWrapper")
			.style("width", "calc(100% - " + oControl.getFieldWidth() + ")")
			.openEnd();

		oRm.openStart("span", oControl.getId() + "-descr")
			.class("sapMInputDescriptionText")
			.openEnd()
			.text(oControl.getDescription())
			.close("span");
		oRm.close("div");
	};

	InputRenderer.writeDecorations = function (oRm, oControl) {
		if (oControl.getDescription()) {
			this.writeDescription(oRm, oControl);
		}

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			if (oControl.getShowSuggestion() && oControl.getEnabled() && oControl.getEditable()) {
				oRm.openStart("span", oControl.getId() + "-SuggDescr").class("sapUiPseudoInvisibleText")
					.attr("role", "status").attr("aria-live", "polite")
					.openEnd()
					.close("span");
			}
		}
	};

	InputRenderer.addWrapperStyles = function (oRm, oControl) {
		oRm.style("width", oControl.getDescription() ? oControl.getFieldWidth() : "100%");
	};

	InputRenderer.getAriaLabelledBy = function (oControl) {
		var ariaLabels = InputBaseRenderer.getAriaLabelledBy.call(this, oControl) || "";

		if (oControl.getDescription()) {
			ariaLabels = ariaLabels + " " + oControl.getId() + "-descr";
		}
		return ariaLabels;
	};

	InputRenderer.getAriaDescribedBy = function (oControl) {

		var sAriaDescribedBy = InputBaseRenderer.getAriaDescribedBy.apply(this, arguments);

		function append(s) {
			sAriaDescribedBy = sAriaDescribedBy ? sAriaDescribedBy + " " + s : s;
		}

		if (oControl.getShowValueHelp() && oControl.getEnabled() && oControl.getEditable()) {
			append(InvisibleText.getStaticId("sap.m", "INPUT_VALUEHELP"));
			if (oControl.getValueHelpOnly()) {
				append(InvisibleText.getStaticId("sap.m", "INPUT_DISABLED"));
			}
		}

		if (oControl.getShowSuggestion() && oControl.getEnabled() && oControl.getEditable()) {
			append(oControl.getId() + "-SuggDescr");
		}

		return sAriaDescribedBy;

	};

	/**
	 * Returns aria accessibility role for the control.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control
	 * @returns {String}
	 */
	InputRenderer.getAriaRole = function (oControl) {
		return "";
	};

	InputRenderer.getAccessibilityState = function (oControl) {

		var mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);


		return mAccessibilityState;

	};

	return InputRenderer;

}, /* bExport= */ true);
