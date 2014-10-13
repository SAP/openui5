/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './InputBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, InputBaseRenderer, Renderer) {
		"use strict";

		/**
		 * @class ComboBoxBase renderer.
		 *
		 * @static
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
		};

		/**
		 * Add inner classes to the ComboBox's input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.addInnerClasses = function(oRm, oControl) {
			oRm.addClass(ComboBoxBaseRenderer.CSS_CLASS + "InputInner");
		};

		/**
		 * Add inner styles to the ComboBox's input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.addInnerStyles = function(oRm, oControl) {
			oRm.writeAttribute("autocomplete", "off");
			oRm.writeAttribute("autocorrect", "off");
			oRm.writeAttribute("autocapitalize", "off");
		};

		/**
		 * Renders the ComboBox's arrow, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxBaseRenderer.writeInnerContent = function(oRm, oControl) {
			oRm.write('<div tabindex="-1"');
			oRm.writeAttribute("id", oControl.getId() + "-arrow");
			oRm.addClass(ComboBoxBaseRenderer.CSS_CLASS + "Arrow");
			oRm.writeClasses();
			oRm.write("></div>");
		};

		return ComboBoxBaseRenderer;

	}, /* bExport= */ true);