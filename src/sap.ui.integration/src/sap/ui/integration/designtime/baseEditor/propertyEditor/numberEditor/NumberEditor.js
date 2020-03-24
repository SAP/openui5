/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString",
	"sap/ui/core/format/NumberFormat"
], function (
	BasePropertyEditor,
	isValidBindingString,
	NumberFormat
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>NumberEditor</code>.
	 * This allows you to set numeric values or binding paths for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.Input}, which prevents non-numeric user input unless it is a valid binding path.
	 * To get notified about changes made with the editor, you can use the <code>attachValueChange</code> method,
	 * which passes the current property value as a number or binding string to the provided callback function when the state changes.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor
	 * @author SAP SE
	 * @since 1.72
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.72
	 * @ui5-restricted
	 */
	var NumberEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor",
		invalidInputError: "BASE_EDITOR.NUMBER.INVALID_BINDING_OR_NUMBER",
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	NumberEditor.prototype.formatValue = function (sValue) {
		if (sValue == null || isValidBindingString(sValue, false)) {
			return sValue;
		}

		var nValue = parseFloat(sValue);
		if (!this.validateNumber(nValue)) {
			this._setValueState(false, this.getI18nProperty(this.invalidInputError));
			return sValue;
		}

		this._setValueState(true);
		return this.getFormatterInstance().format(nValue);
	};

	NumberEditor.prototype.setValue = function (vValue) {
		// When a string arrives through setValue, it might come directly from the manifest
		// As we don't know the locale in which the value was created we assume default EN locale
		this._parseAndSetValue(vValue, false, true);
	};

	NumberEditor.prototype._onLiveChange = function (oEvent) {
		// When a string arrives through editor, we assume the users locale was used
		this._parseAndSetValue(oEvent.getParameter("newValue"), true, false);
	};

	NumberEditor.prototype._parseAndSetValue = function (vValue, bIsLocalizedValue, bAllowInvalidValue) {
		var vParsedValue = bIsLocalizedValue ? this._parseAndValidateLocalized(vValue) : this._parseAndValidate(vValue);
		this._setValueState(!!(!vValue || vParsedValue), this.getI18nProperty(this.invalidInputError));
		if (!vValue || vParsedValue || bAllowInvalidValue) {
			BasePropertyEditor.prototype.setValue.call(this, vParsedValue || vValue);
		}
	};

	/**
	 * Override to customize input validation
	 */
	NumberEditor.prototype.validateNumber = function (vValue) {
		return !isNaN(vValue);
	};

	NumberEditor.prototype.getFormatterInstance = function () {
		return NumberFormat.getFloatInstance();
	};

	NumberEditor.prototype._parseAndValidate = function (vValue) {
		if (!vValue || isValidBindingString(vValue, false)) {
			return vValue;
		}

		var nValue = parseFloat(vValue);
		return this.validateNumber(nValue) ? nValue : undefined;
	};

	NumberEditor.prototype._parseAndValidateLocalized = function (vValue) {
		if (!vValue || isValidBindingString(vValue, false)) {
			return vValue;
		}

		var nValue = this.getFormatterInstance().parse(vValue);
		return this.validateNumber(nValue) ? nValue : undefined;
	};

	NumberEditor.prototype._setValueState = function (bIsValid, sError) {
		var oInput = this.getContent();
		if (bIsValid) {
			oInput.setValueState("None");
		} else {
			oInput.setValueState("Error");
			oInput.setValueStateText(sError);
		}
	};

	return NumberEditor;
});
