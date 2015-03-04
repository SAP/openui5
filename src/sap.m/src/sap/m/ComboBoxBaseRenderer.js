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
		 * Writes the accessibility state.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.writeAccessibilityState = function(oRm, oControl) {
			oRm.writeAccessibilityState(oControl, {
				role: "combobox",
				expanded: oControl.isOpen(),
				autocomplete: "both"
			});
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
			this.renderButton(oRm, oControl.getId() + "-arrow");
		};

		/**
		 * Renders the combo box button, using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {string} sId Id for the button.
		 */
		ComboBoxBaseRenderer.renderButton = function(oRm, sId) {
			oRm.write('<button tabindex="-1"');
			oRm.writeAttribute("id", sId);
			oRm.addClass(ComboBoxBaseRenderer.CSS_CLASS + "Arrow");
			oRm.writeClasses();
			oRm.write("></button>");
		};

		return ComboBoxBaseRenderer;

	}, /* bExport= */ true);