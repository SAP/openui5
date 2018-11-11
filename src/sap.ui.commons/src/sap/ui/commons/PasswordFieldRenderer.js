/*!
 * ${copyright}
 */

sap.ui.define(['./TextFieldRenderer', 'sap/ui/core/Renderer', 'sap/ui/Device'],
	function(TextFieldRenderer, Renderer, Device) {
	"use strict";


	/**
	 * PasswordFieldRenderer.
	 * @namespace
	 */
	var PasswordFieldRenderer = Renderer.extend(TextFieldRenderer);


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oPasswordField an object representation of the control that should be rendered
	 */
	PasswordFieldRenderer.renderInnerAttributes = function(rm, oPasswordField) {

		if (Device.support.input.placeholder || oPasswordField.getValue() || !oPasswordField.getPlaceholder()) {
			// if browser not supports placeholder on input tag, set the password type only if placeholder is not displayed
			rm.writeAttribute('type', 'password');
		}

	};


	PasswordFieldRenderer.renderTextFieldEnabled = function(rm, oPasswordField) {
		if (!oPasswordField.getEnabled() && !oPasswordField.getEditable()) {
			// "disabled" may not be rendered because the Jaws screenreader then reads the password
			// use "readonly" instead
			// but write it only if it has not yet been written by the TextFieldRenderer
			rm.writeAttribute('readonly', 'readonly');
			rm.writeAttribute('tabindex', '-1'); // apart from that, act as if disabled, e.g. no tab-stop
		} else {
			rm.writeAttribute('tabindex', '0'); // editable and readonly have a tab-stop
		}
	};


	// this method uses "readonly" instead of "disabled" because with "disabled" the Jaws screenreader reads the password
	PasswordFieldRenderer.setEnabled = function(oPasswordField, bEnabled) {
		var $TFRef = oPasswordField.$();

		if (bEnabled) {
			if (oPasswordField.getEditable()) {
				$TFRef.removeClass('sapUiTfDsbl').addClass('sapUiTfStd');
				$TFRef.removeAttr('readonly').attr('tabindex', '0');
			} else {
				$TFRef.removeClass('sapUiTfDsbl').addClass('sapUiTfRo');
				$TFRef.attr('tabindex', '0');
			}
		} else {
			if (oPasswordField.getEditable()) {
				$TFRef.removeClass('sapUiTfStd').addClass('sapUiTfDsbl');
				$TFRef.attr('readonly', 'readonly').attr('tabindex', '-1');
			} else {
				$TFRef.removeClass('sapUiTfRo').addClass('sapUiTfDsbl');
				$TFRef.attr( 'tabindex', '-1');
			}
		}
	};



	return PasswordFieldRenderer;

}, /* bExport= */ true);
