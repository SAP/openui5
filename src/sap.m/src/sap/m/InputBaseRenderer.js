/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/library', 'sap/ui/core/LabelEnablement', 'sap/ui/Device'],
	function(Renderer, coreLibrary, LabelEnablement, Device) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Input renderer.
	 *
	 * @namespace
	 */
	var InputBaseRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.render = function(oRm, oControl) {
		var sValueState = oControl.getValueState(),
			sTextDir = oControl.getTextDirection(),
			sTextAlign = Renderer.getTextAlign(oControl.getTextAlign(), sTextDir),
			bAccessibility = sap.ui.getCore().getConfiguration().getAccessibility(),
			aBeginIcons = oControl.getAggregation("_beginIcon") || [],
			aEndIcons = oControl.getAggregation("_endIcon") || [],
			aVisibleBeginIcons, aVisibleEndIcons;

		oRm.openStart("div", oControl);

		// outer styles
		this.addOuterStyles(oRm, oControl);

		this.addControlWidth(oRm, oControl);

		// outer classes
		oRm.class("sapMInputBase");
		this.addPaddingClass(oRm, oControl);
		this.addCursorClass(oRm, oControl);
		this.addOuterClasses(oRm, oControl);

		if (!oControl.getEnabled()) {
			oRm.class("sapMInputBaseDisabled");
		}

		if (!oControl.getEditable()) {
			oRm.class("sapMInputBaseReadonly");
		}

		if (sValueState !== ValueState.None) {
			oRm.class("sapMInputBaseState");
		}

		if (aBeginIcons.length) {

			aVisibleBeginIcons = aBeginIcons.filter(function (oIcon) {
				return oIcon.getVisible();
			});

			aVisibleBeginIcons.length && oRm.class("sapMInputBaseHasBeginIcons");
		}

		if (aEndIcons.length) {

			aVisibleEndIcons = aEndIcons.filter(function (oIcon) {
				return oIcon.getVisible();
			});

			aVisibleEndIcons.length && oRm.class("sapMInputBaseHasEndIcons");
		}

		// outer attributes
		this.writeOuterAttributes(oRm, oControl);
		var sTooltip = oControl.getTooltip_AsString();

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.openEnd();

		oRm.openStart("div", oControl.getId() + "-content");
		oRm.class("sapMInputBaseContentWrapper");

		// check disable and readonly
		if (!oControl.getEnabled()) {
			oRm.class("sapMInputBaseDisabledWrapper");

		} else if (!oControl.getEditable()) {
			oRm.class("sapMInputBaseReadonlyWrapper");
		}

		if (sValueState !== ValueState.None) {
			this.addValueStateClasses(oRm, oControl);
		}

		// some controls need to have accessibility attributes applied one level up than the input
		this.writeAccAttributes(oRm, oControl);
		this.addWrapperStyles(oRm, oControl);

		oRm.openEnd();

		if (aBeginIcons.length) {
			this.writeIcons(oRm, aBeginIcons);
		}

		this.prependInnerContent(oRm, oControl);

		// start inner
		this.openInputTag(oRm, oControl);

		// write the name of input
		if (oControl.getName()) {
			oRm.attr("name", oControl.getName());
		}

		// let the browser handle placeholder
		if (!oControl.bShowLabelAsPlaceholder && oControl._getPlaceholder()) {
			oRm.attr("placeholder", oControl._getPlaceholder());
		}

		// check if there is a maxLength property
		if (oControl.getMaxLength && oControl.getMaxLength() > 0) {
			oRm.attr("maxlength", oControl.getMaxLength());
		}
		if (!oControl.getEnabled()) {
			oRm.attr("disabled", "disabled");

		} else if (!oControl.getEditable()) {
			oRm.attr("readonly", "readonly");

		}

		if (LabelEnablement.isRequired(oControl)) {
			oRm.attr("required", "required");
		}

		// check if textDirection property is not set to default "Inherit" and add "dir" attribute
		if (sTextDir != TextDirection.Inherit) {
			oRm.attr("dir", sTextDir.toLowerCase());
		}

		this.writeInnerValue(oRm, oControl);

		// accessibility states
		if (bAccessibility) {
			this.writeAccessibilityState(oRm, oControl);
		}

		if (Device.browser.mozilla) {
			if (sTooltip) {

				// fill tooltip to mozilla validation flag too, to display it in validation error case too
				oRm.attr("x-moz-errormessage", sTooltip);
			} else {

				// if no tooltip use blank text for mozilla validation text
				oRm.attr("x-moz-errormessage", " ");
			}
		}

		this.writeInnerAttributes(oRm, oControl);

		// inner classes
		oRm.class("sapMInputBaseInner");

		this.addInnerClasses(oRm, oControl);

		// write text-align
		oRm.style("text-align", sTextAlign);
		this.addInnerStyles(oRm, oControl);
		this.endInputTag(oRm, oControl);

		// finish inner
		this.writeInnerContent(oRm, oControl);
		this.closeInputTag(oRm, oControl);

		// write the end icons after the inner part
		if (aEndIcons.length) {
			this.writeIcons(oRm, aEndIcons);
		}

		// close wrapper div
		oRm.close("div");

		// for backward compatibility
		this.writeDecorations(oRm, oControl);

		// render hidden aria nodes
		if (bAccessibility) {
			this.renderAriaLabelledBy(oRm, oControl);
			this.renderAriaDescribedBy(oRm, oControl);
		}

		// finish outer
		oRm.close("div");
	};

	/**
	 * Returns aria accessibility role for the control.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control
	 * @returns {String}
	 */
	InputBaseRenderer.getAriaRole = function(oControl) {
		return "textbox";
	};

	/**
	 * Returns the inner aria labelledby ids for the accessibility.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String|undefined}
	 */
	InputBaseRenderer.getAriaLabelledBy = function(oControl) {
		if (this.getLabelledByAnnouncement(oControl)) {
			return oControl.getId() + "-labelledby";
		}
	};

	/**
	 * Returns the inner aria labelledby announcement texts for the accessibility.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String}
	 */
	InputBaseRenderer.getLabelledByAnnouncement = function(oControl) {
		return "";
	};

	/**
	 * Renders the hidden aria labelledby node for the accessibility.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.renderAriaLabelledBy = function(oRm, oControl) {
		var sAnnouncement = this.getLabelledByAnnouncement(oControl);
		if (sAnnouncement) {
			oRm.openStart("span", oControl.getId() + "-labelledby");
			oRm.attr("aria-hidden", "true");
			oRm.class("sapUiInvisibleText");
			oRm.openEnd();
			oRm.text(sAnnouncement.trim());
			oRm.close("span");
		}
	};

	/**
	 * Returns the inner aria describedby ids for the accessibility.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String|undefined}
	 */
	InputBaseRenderer.getAriaDescribedBy = function(oControl) {
		if (this.getDescribedByAnnouncement(oControl)) {
			return oControl.getId() + "-describedby";
		}
	};

	/**
	 * Returns the inner aria describedby announcement texts for the accessibility.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String}
	 */
	InputBaseRenderer.getDescribedByAnnouncement = function(oControl) {
		return "";
	};

	/**
	 * Renders the hidden aria labelledby node for the accessibility.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.renderAriaDescribedBy = function(oRm, oControl) {
		var sAnnouncement = this.getDescribedByAnnouncement(oControl);
		if (sAnnouncement) {
			oRm.openStart("span", oControl.getId() + "-describedby");
			oRm.attr("aria-hidden", "true");
			oRm.class("sapUiInvisibleText");
			oRm.openEnd();
			oRm.text(sAnnouncement.trim());
			oRm.close("span");
		}
	};

	/**
	 * Returns the accessibility state of the control.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {Object}
	 */
	InputBaseRenderer.getAccessibilityState = function(oControl) {
		var sAriaLabelledBy = this.getAriaLabelledBy(oControl),
			sAriaDescribedBy = this.getAriaDescribedBy(oControl),
			sRole = this.getAriaRole(oControl),
			mAccessibilityState = { };

		if (sRole) {
			mAccessibilityState.role = sRole;
		}

		if (oControl.getValueState() === ValueState.Error) {
			mAccessibilityState.invalid = true;
		}

		if (sAriaLabelledBy) {
			mAccessibilityState.labelledby = {
				value: sAriaLabelledBy.trim(),
				append: true
			};
		}

		if (sAriaDescribedBy) {
			mAccessibilityState.describedby = {
				value: sAriaDescribedBy.trim(),
				append: true
			};
		}
		mAccessibilityState.disabled = null;
		mAccessibilityState.readonly = null;
		mAccessibilityState.required = null;

		return mAccessibilityState;
	};

	/**
	 * Writes the accessibility state of the control.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeAccessibilityState = function(oRm, oControl) {
		oRm.accessibilityState(oControl, this.getAccessibilityState(oControl));
	};

	/**
	 * Write the opening tag name of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.openInputTag = function(oRm, oControl) {
		oRm.voidStart("input", oControl.getId() + "-" + this.getInnerSuffix());
	};

	/**
	 * Ends opened input tag.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.endInputTag = function(oRm, oControl) {
		oRm.voidEnd();
	};

	/**
	 * Write the value of the input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeInnerValue = function(oRm, oControl) {
		oRm.attr("value", oControl.getValue());
	};

	/**
	 * Add cursor class to input container.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addCursorClass = function(oRm, oControl) {};

	/**
	 * Add a padding class to input container.
	 * May be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addPaddingClass = function(oRm, oControl) {
		oRm.class("sapMInputBaseHeightMargin");
	};

	/**
	 * This method is reserved for derived class to add extra styles for input container.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addOuterStyles = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived class to set width inline style
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addControlWidth = function(oRm, oControl) {
		if (!oControl.getProperty('width')) {
			oRm.class("sapMInputBaseNoWidth");
		}

		oRm.style("width", oControl.getWidth());
	};

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
	 * This method is reserved for derived class to add extra attributes for the container one level upper of input.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeAccAttributes = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived classes to add extra styles for input element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addInnerStyles = function(oRm, oControl) {};

	/**
	 * This method is reserved for derived classes to add extra styles for input element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addWrapperStyles = function(oRm, oControl) {
		oRm.style("width", "100%");
	};

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
	 * Renders icons from the icon aggregations.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 * @param {string} sPosition An aggregation from which the icon should be rendered - begin or end.
	 */
	InputBaseRenderer.writeIcons = function (oRm, aIcons) {
		oRm.openStart("div");
		oRm.attr("tabindex", "-1");
		oRm.class("sapMInputBaseIconContainer");
		oRm.openEnd();
		aIcons.forEach(oRm.renderControl, oRm);
		oRm.close("div");
	};

	/**
	 * Write the decorations of the input - description and value-help icon.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.writeDecorations = function (oRm, oControl) {};

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
	 * @deprecated
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addPlaceholderStyles = function(oRm, oControl) {};

	/**
	 * Adds custom placeholder classes, if native placeholder is not used.
	 * To be overwritten by subclasses.
	 * Note that this method should not be used anymore as native placeholder is used on all browsers
	 *
	 * @deprecated
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addPlaceholderClasses = function(oRm, oControl) {};

	/**
	 * Add the CSS value state classes to the control's root element using the provided {@link sap.ui.core.RenderManager}.
	 * To be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	InputBaseRenderer.addValueStateClasses = function(oRm, oControl) {
		oRm.class("sapMInputBaseContentWrapperState");
		oRm.class("sapMInputBaseContentWrapper" + oControl.getValueState());
	};

	/**
	 * Defines the ID suffix of the inner element
	 *
	 * @returns {string} The inner element ID suffix.
	 */
	InputBaseRenderer.getInnerSuffix = function() {
		return "inner";
	};

	return InputBaseRenderer;

}, /* bExport= */ true);
