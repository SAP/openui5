/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/ui/core/ValueStateSupport'],
	function(jQuery, Renderer, ValueStateSupport) {
	"use strict";


	/**
	 * Input renderer.
	 *
	 * @namespace
	 */
	var InputBaseRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.render = function(oRm, oControl) {
		var sValueState = oControl.getValueState();
		var sTextDir = oControl.getTextDirection();
		var sTextAlign = Renderer.getTextAlign(oControl.getTextAlign(), sTextDir);

		oRm.write("<div");
		oRm.writeControlData(oControl);

		// outer styles
		this.addOuterStyles(oRm, oControl);

		if (oControl.getWidth()) {
			oRm.addStyle("width", oControl.getWidth());
		}

		oRm.writeStyles();

		// outer classes
		oRm.addClass("sapMInputBase");
		this.addCursorClass(oRm, oControl);
		this.addOuterClasses(oRm, oControl);

		if (!oControl.getEnabled()) {
			oRm.addClass("sapMInputBaseDisabled");
		}

		if (!oControl.getEditable()) {
			oRm.addClass("sapMInputBaseReadonly");
		}

		if (sValueState !== sap.ui.core.ValueState.None) {
			this.addValueStateClasses(oRm, oControl);
		}

		oRm.writeClasses();

		// outer attributes
		this.writeOuterAttributes(oRm, oControl);
		var sTooltip = ValueStateSupport.enrichTooltip(oControl, oControl.getTooltip_AsString());

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		oRm.write(">");

		this.prependInnerContent(oRm, oControl);

		// enable self-made placeholder
		if (oControl.bShowLabelAsPlaceholder) {
			oRm.write("<label");
			oRm.writeAttribute("id", oControl.getId() + "-placeholder");
			oRm.writeAttribute("for", oControl.getId() + "-inner");
			if (sTextAlign) {
				oRm.addStyle("text-align", sTextAlign);
			}
			this.addPlaceholderClasses(oRm, oControl);
			this.addPlaceholderStyles(oRm, oControl);
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			oRm.writeEscaped(oControl._getPlaceholder());
			oRm.write("</label>");
		}

		// start inner
		this.openInputTag(oRm, oControl);

		// inner attributes
		oRm.writeAttribute("id", oControl.getId() + "-inner");

		// write the name of input
		if (oControl.getName()) {
			oRm.writeAttributeEscaped("name", oControl.getName());
		}

		// let the browser handle placeholder
		if (!oControl.bShowLabelAsPlaceholder && oControl._getPlaceholder()) {
			oRm.writeAttributeEscaped("placeholder", oControl._getPlaceholder());
		}

		// check if there is a maxLength property
		if (oControl.getMaxLength && oControl.getMaxLength() > 0) {
			oRm.writeAttribute("maxlength", oControl.getMaxLength());
		}

		// check disable and readonly
		if (!oControl.getEnabled()) {
			oRm.writeAttribute("disabled", "disabled");
			oRm.addClass("sapMInputBaseDisabledInner");
		} else if (!oControl.getEditable()) {
			oRm.writeAttribute("tabindex", "-1");
			oRm.writeAttribute("readonly", "readonly");
			oRm.addClass("sapMInputBaseReadonlyInner");
		}

		// check if textDirection property is not set to default "Inherit" and add "dir" attribute
		if (sTextDir != sap.ui.core.TextDirection.Inherit) {
			oRm.writeAttribute("dir", sTextDir.toLowerCase());
		}

		this.writeInnerValue(oRm, oControl);
		this.writeAccessibilityState(oRm, oControl);

		if (sap.ui.Device.browser.mozilla) {
			if (sTooltip) {
				// fill tooltip to mozilla validation flag too, to display it in validation error case too
				oRm.writeAttributeEscaped("x-moz-errormessage", sTooltip);
			} else {
				// if no tooltip use blank text for mozilla validation text
				oRm.writeAttribute("x-moz-errormessage", " ");
			}
		}

		this.writeInnerAttributes(oRm, oControl);

		// inner classes
		oRm.addClass("sapMInputBaseInner");
		if (sValueState !== sap.ui.core.ValueState.None) {
			oRm.addClass("sapMInputBaseStateInner");
			oRm.addClass("sapMInputBase" + sValueState + "Inner");
		}
		this.addInnerClasses(oRm, oControl);
		oRm.writeClasses();

		// write text-align
		if (sTextAlign) {
			oRm.addStyle("text-align", sTextAlign);
		}

		// inner styles
		this.addInnerStyles(oRm, oControl);
		oRm.writeStyles();
		oRm.write(">");

		// finish inner
		this.writeInnerContent(oRm, oControl);
		this.closeInputTag(oRm, oControl);

		// finish outer
		oRm.write("</div>");
	};

	/**
	 * Writes the accessibility state.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeAccessibilityState = function(oRm, oControl) {
		oRm.writeAccessibilityState(oControl);
	};

	/**
	 * This method is reserved for derived classes to add extra attributes to the Input.
	 *
	 * @deprecated sap.m.InputBaseRenderer#writeInnerAttributes should be called instead of this method.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeAttributes = function(oRm, oControl) {
		jQuery.sap.log.warning("Usage of deprecated function: sap.m.InputBaseRenderer#writeAttributes");
		this.writeInnerAttributes(oRm, oControl);
	};

	/**
	 * Adds extra CSS class.
	 *
	 * @deprecated sap.m.InputBaseRenderer#addOuterClasses should be called instead of this method.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addClasses = function(oRm, oControl) {
		jQuery.sap.log.warning("Usage of deprecated function: sap.m.InputBaseRenderer#addClasses");
		this.addOuterClasses(oRm, oControl);
	};

	/**
	 * Write the opening tag name of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.openInputTag = function(oRm, oControl) {
		oRm.write("<input");
	};

	/**
	 * Write the value of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeInnerValue = function(oRm, oControl) {
		oRm.writeAttributeEscaped("value", oControl.getValue());
	};

	/**
	 * Add cursor class to input container.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addCursorClass = function(oRm, oControl) {
	};

	/**
	 * This method is reserved for derived class to add extra styles for input container.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addOuterStyles = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived classes to add extra classes for input container.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addOuterClasses = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived class to add extra attributes for input container.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeOuterAttributes = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived classes to add extra styles for input element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addInnerStyles = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived classes to add extra classes for input element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addInnerClasses = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived classes to add extra attributes for the input element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeInnerAttributes = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived classes to prepend inner content.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.prependInnerContent = function(oRm, oControl) {};

	/**
	 * Write the value of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeInnerContent = function(oRm, oControl) {};

	/**
	 * Write the closing tag name of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.closeInputTag = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived classes to add extra styles for the placeholder, if rendered as label.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addPlaceholderStyles = function(oRm, oControl) {};

	/**
	 * Adds custom placeholder classes, if native placeholder is not used.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addPlaceholderClasses = function(oRm, oControl) {
		oRm.addClass("sapMInputBasePlaceholder");
	};

	/**
	 * Add the CSS value state classes to the control's root element using the provided {@link sap.ui.core.RenderManager}.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addValueStateClasses = function(oRm, oControl) {
		oRm.addClass("sapMInputBaseState");
		oRm.addClass("sapMInputBase" + oControl.getValueState());
	};

	return InputBaseRenderer;

}, /* bExport= */ true);
