/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './InputBaseRenderer', 'sap/m/library'],
	function(Renderer, InputBaseRenderer, library) {
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

	/**
	 * Adds control specific class
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.addOuterClasses = function(oRm, oControl) {
		oRm.addClass("sapMInput");
		if (oControl.getShowValueHelp() && oControl.getEnabled() && oControl.getEditable()) {
			oRm.addClass("sapMInputVH");
			if (oControl.getValueHelpOnly()) {
				oRm.addClass("sapMInputVHO");
			}
		}
		if (oControl.getDescription()) {
				oRm.addClass("sapMInputDescription");
		}
	};

	/**
	 * Add extra styles for input container
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.addOuterStyles = function(oRm, oControl) {
	};

	/**
	 * add extra attributes to Input
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.writeInnerAttributes = function(oRm, oControl) {
		oRm.writeAttribute("type", oControl.getType().toLowerCase());
		//if Input is of type "Number" step attribute should be "any" allowing input of floating point numbers
		if (oControl.getType() == InputType.Number) {
			oRm.writeAttribute("step", "any");
		}
		if (oControl.getType() == InputType.Number && sap.ui.getCore().getConfiguration().getRTL()) {
			oRm.writeAttribute("dir", "ltr");
			oRm.addStyle("text-align", "right");
		}

		if (oControl.getShowSuggestion()) {
			oRm.writeAttribute("autocomplete", "off");
		}

		if ((!oControl.getEnabled() && oControl.getType() == "Password")
				|| (oControl.getShowSuggestion() && oControl._bUseDialog)
				|| (oControl.getValueHelpOnly() && oControl.getEnabled() && oControl.getEditable() && oControl.getShowValueHelp())) {
			// required for JAWS reader on password fields on desktop and in other cases:
			oRm.writeAttribute("readonly", "readonly");
		}
	};

	/**
	 * Adds inner css classes to the input field
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.addInnerClasses = function(oRm, oControl) {
	};

	/**
	 * Add inner styles to the input field
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.addWrapperStyles = function(oRm, oControl) {

		if (oControl.getDescription()) {
			oRm.addStyle("width", oControl.getFieldWidth() || "50%");
		}
	};

	/**
	 * Write the decorations of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputRenderer.writeDecorations = function(oRm, oControl) {

		var id = oControl.getId(),
			description = oControl.getDescription();

		if (!description) {
			this.writeValueHelpIcon(oRm, oControl);
		} else {
			oRm.write("<span>");
			this.writeValueHelpIcon(oRm, oControl);
			oRm.write('<span id="' + oControl.getId() + '-Descr" class="sapMInputDescriptionText">');
			oRm.writeEscaped(description);
			oRm.write("</span></span>");
		}

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			if (oControl.getShowSuggestion() && oControl.getEnabled() && oControl.getEditable()) {
				oRm.write("<span id=\"" + id + "-SuggDescr\" class=\"sapUiPseudoInvisibleText\" role=\"status\" aria-live=\"polite\"></span>");
			}
		}

	};

	InputRenderer.writeValueHelpIcon = function(oRm, oControl) {

		if (oControl.getShowValueHelp() && oControl.getEnabled() && oControl.getEditable()) {
			// Set tabindex to -1 to prevent the focus from going to the underlying list row,
			// in case when the input is placed inside of a list/table.
			oRm.write('<div class="sapMInputValHelp" tabindex="-1">');
			oRm.renderControl(oControl._getValueHelpIcon());
			oRm.write("</div>");
		}

	};

	/**
	 * Add inner styles to the placeholder
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.addPlaceholderStyles = function(oRm, oControl) {

		if (oControl.getDescription()) {
			oRm.addStyle("width", oControl.getFieldWidth() || "50%");
		}

	};

	InputRenderer.getAriaLabelledBy = function(oControl) {
		var ariaLabels = InputBaseRenderer.getAriaLabelledBy.call(this, oControl) || "";
		if (oControl.getDescription()) {
			ariaLabels = ariaLabels + " " + oControl.getId() + "-Descr";
		}
		return ariaLabels;
	};

	InputRenderer.getAriaDescribedBy = function(oControl) {

		var sAriaDescribedBy = InputBaseRenderer.getAriaDescribedBy.apply(this, arguments);

		if (oControl.getShowValueHelp() && oControl.getEnabled() && oControl.getEditable()) {
			if (sAriaDescribedBy) {
				sAriaDescribedBy = sAriaDescribedBy + " " + oControl._sAriaValueHelpLabelId;
			} else {
				sAriaDescribedBy = oControl._sAriaValueHelpLabelId;
			}
			if (oControl.getValueHelpOnly()) {
				sAriaDescribedBy = sAriaDescribedBy + " " + oControl._sAriaInputDisabledLabelId;
			}
		}

		if (oControl.getShowSuggestion() && oControl.getEnabled() && oControl.getEditable()) {
			if (sAriaDescribedBy) {
				sAriaDescribedBy = sAriaDescribedBy + " " + oControl.getId() + "-SuggDescr";
			} else {
				sAriaDescribedBy = oControl.getId() + "-SuggDescr";
			}
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
	InputRenderer.getAriaRole = function(oControl) {
		return "";
	};

	InputRenderer.getAccessibilityState = function(oControl) {

		var mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);

		if (oControl.getShowSuggestion() && oControl.getEnabled() && oControl.getEditable()) {
			mAccessibilityState.autocomplete = "list";
		}

		return mAccessibilityState;

	};

	return InputRenderer;

}, /* bExport= */ true);
