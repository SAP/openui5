/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './InputBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, InputBaseRenderer, Renderer) {
		"use strict";

		/**
		 * ComboBoxBase renderer.
		 *
		 * @namespace
		 */
		var ComboBoxBaseRenderer = Renderer.extend(InputBaseRenderer);

		/**
		 * CSS class to be applied to the root element of the ComboBoxBase.
		 *
		 * @readonly
		 * @const {string}
		 */
		ComboBoxBaseRenderer.CSS_CLASS = "sapMComboBoxBase";

		/**
		 * Writes attributes to the control's root element.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.writeOuterAttributes = function(oRm, oControl) {

			// note: in IE browsers, JAWS 15.0 announce the ComboBox only if
			// the role combobox is set to the control's root element
			oRm.writeAttribute("role", "combobox");
		};

		/**
		 * Add attributes to the input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.writeInnerAttributes = function(oRm, oControl) {
			oRm.writeAttribute("autocomplete", "off");
			oRm.writeAttribute("autocorrect", "off");
			oRm.writeAttribute("autocapitalize", "off");
		};

		/**
		 * Retrieves the ARIA role for the control.
		 * To be overwritten by subclasses.
		 *
		 */
		ComboBoxBaseRenderer.getAriaRole = function() {
			return "combobox";
		};

		/**
		 * Retrieves the accessibility state of the control.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.getAccessibilityState = function(oControl) {
			var mAccessibilityState = sap.m.InputBaseRenderer.getAccessibilityState.call(this, oControl);

			mAccessibilityState.expanded = oControl.isOpen();
			mAccessibilityState.autocomplete = "both";

			return mAccessibilityState;
		};

		/**
		 * Add extra styles for input container.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.addOuterStyles = function(oRm, oControl) {
			oRm.addStyle("max-width", oControl.getMaxWidth());
		};

		/**
		 * Add classes to the ComboBox.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.addOuterClasses = function(oRm, oControl) {
			var CSS_CLASS = ComboBoxBaseRenderer.CSS_CLASS;

			oRm.addClass(CSS_CLASS);
			oRm.addClass(CSS_CLASS + "Input");

			if (!oControl.getEnabled()) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}

			if (!oControl.getEditable()) {
				oRm.addClass(CSS_CLASS + "Readonly");
			}
		};

		/**
		 * Add inner classes to the ComboBox's input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.addInnerClasses = function(oRm, oControl) {
			var CSS_CLASS = ComboBoxBaseRenderer.CSS_CLASS;
			oRm.addClass(CSS_CLASS + "InputInner");

			if (!oControl.getEditable()) {
				oRm.addClass(CSS_CLASS + "InputInnerReadonly");
			}
		};

		/**
		 * Renders the ComboBox's arrow, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.writeInnerContent = function(oRm, oControl) {
			this.renderButton(oRm, oControl);
		};

		/**
		 * Renders the combo box button, using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.renderButton = function(oRm, oControl) {
			var sId = oControl.getId(),
				sButtonId = sId + "-arrow",
				sButtonLabelId = sId + "-buttonlabel",
				oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			oRm.write('<button tabindex="-1"');
			oRm.writeAttribute("id", sButtonId);
			oRm.writeAttribute("aria-labelledby", sButtonLabelId);
			oRm.addClass(ComboBoxBaseRenderer.CSS_CLASS + "Arrow");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<label");
			oRm.writeAttribute("id", sButtonLabelId);
			oRm.addClass("sapUiInvisibleText");
			oRm.addClass(ComboBoxBaseRenderer.CSS_CLASS + "ButtonLabel");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write(oRb.getText("COMBOBOX_BUTTON"));
			oRm.write("</label>");
			oRm.write("</button>");
		};

		return ComboBoxBaseRenderer;

	}, /* bExport= */ true);
