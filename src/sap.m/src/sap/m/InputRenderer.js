/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/i18n/Localization", "sap/ui/core/ControlBehavior", 'sap/ui/core/InvisibleText', 'sap/ui/core/Renderer', './InputBaseRenderer', 'sap/m/library'],
	function(Localization, ControlBehavior, InvisibleText, Renderer, InputBaseRenderer, library) {
	"use strict";


	// shortcut for sap.m.InputType
	var InputType = library.InputType;


	/**
	 * Input renderer.
	 *
	 * InputRenderer extends the InputBaseRenderer
	 *
	 * @namespace
	 * @alias sap.m.InputRenderer
	 * @static
	 * @protected
	 */
	var InputRenderer = Renderer.extend(InputBaseRenderer);
	InputRenderer.apiVersion = 2;

	/**
	 * Adds control specific class
	 *
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Input} oControl an object representation of the control that should be rendered
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
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Input} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.writeInnerAttributes = function (oRm, oControl) {
		var bShowSuggestions = oControl.getShowSuggestion();
		var bAddReadOnly = oControl.getShowSuggestion() && oControl.isMobileDevice();

		oRm.attr("type", oControl.getType().toLowerCase());
		//if Input is of type "Number" step attribute should be "any" allowing input of floating point numbers
		if (oControl.getType() == InputType.Number) {
			oRm.attr("step", "any");
		}
		if (oControl.getType() == InputType.Number && Localization.getRTL()) {
			oRm.attr("dir", "ltr").style("text-align", "right");
		}

		if (bShowSuggestions || oControl.getShowValueStateMessage()) {
			oRm.attr("autocomplete", "off"); // autocomplete="off" needed so the native browser autocomplete is not shown?
		}

		/**
		 * @deprecated As of version 1.119
		 */
		bAddReadOnly = bAddReadOnly || (oControl.getValueHelpOnly() && oControl.getEnabled() && oControl.getEditable() && oControl.getShowValueHelp());

		if (bAddReadOnly) {
			oRm.attr("readonly", "readonly");
		}
	};

	InputRenderer.writeOuterAttributes = function (oRm, oControl) {
		oRm.attr("data-ui5-accesskey", oControl.getProperty("accesskey"));
	};

	/**
	 * Adds inner css classes to the input field
	 *
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Input} oControl an object representation of the control that should be rendered
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

	/**
	 * Write the decorations of the input - description and value-help icon.
	 *
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Input} oControl An object representation of the control that should be rendered.
	 */
	InputRenderer.writeDecorations = function (oRm, oControl) {
		if (oControl.getDescription()) {
			this.writeDescription(oRm, oControl);
		}

		if (ControlBehavior.isAccessibilityEnabled()) {
			if (oControl.getShowSuggestion() && oControl.getEnabled() && oControl.getEditable()) {
				oRm.openStart("span", oControl.getId() + "-SuggDescr").class("sapUiPseudoInvisibleText")
					.attr("role", "status").attr("aria-live", "polite")
					.openEnd()
					.close("span");
			}
		}
	};

	/**
	 * Adds extra styles to the wrapper of the input field.
	 *
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Input} oControl An object representation of the control that should be rendered.
	 */
	InputRenderer.addWrapperStyles = function (oRm, oControl) {
		oRm.style("width", oControl.getDescription() ? oControl.getFieldWidth() : "100%");
	};

	/**
	 * Returns the inner aria describedby ids for the accessibility.
	 *
	 * @protected
	 * @param {sap.m.Input} oControl an object representation of the control.
	 * @returns {string|undefined}
	 */
	InputRenderer.getAriaDescribedBy = function (oControl) {

		var sAriaDescribedBy = InputBaseRenderer.getAriaDescribedBy.apply(this, arguments);

		function append(s) {
			sAriaDescribedBy = sAriaDescribedBy ? sAriaDescribedBy + " " + s : s;
		}

		if (oControl.getDescription()) {
			append(oControl.getId() + "-descr");
		}

		if (oControl.getShowValueHelp() && oControl.getEnabled() && oControl.getEditable()) {
			append(InvisibleText.getStaticId("sap.m", "INPUT_VALUEHELP"));
			if (oControl.getValueHelpOnly()) {
				append(InvisibleText.getStaticId("sap.m", "INPUT_DISABLED"));
			}
		}

		return sAriaDescribedBy;

	};

	/**
	 * Returns aria accessibility role for the control.
	 * Hook for the subclasses.
	 *
	 * @protected
	 * @param {sap.m.Input} oControl an object representation of the control
	 * @returns {string}
	 */
	InputRenderer.getAriaRole = function (oControl) {
		return "";
	};

	InputRenderer.getAccessibilityState = function (oControl) {
		var bShowSuggestions = oControl.getShowSuggestion();

		var mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);

		if (bShowSuggestions) {
			mAccessibilityState["haspopup"] = "listbox";
		}


		return mAccessibilityState;

	};

	return InputRenderer;

}, /* bExport= */ true);
