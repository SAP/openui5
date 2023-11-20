/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString",
	"sap/base/util/restricted/_isNil",
	"sap/ui/core/format/NumberFormat"
], function (
	BasePropertyEditor,
	isValidBindingString,
	_isNil,
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
		metadata: {
			library: "sap.ui.integration"
		},
		invalidInputError: "BASE_EDITOR.NUMBER.INVALID_BINDING_OR_NUMBER",
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	NumberEditor.prototype.getDefaultValidators = function () {
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidators.call(this),
			{
				isNumber: {
					type: "isNumber"
				}
			}
		);
	};

	NumberEditor.configMetadata = Object.assign(
		{},
		BasePropertyEditor.configMetadata,
		{
			typeLabel: {
				defaultValue: "BASE_EDITOR.TYPES.NUMBER"
			}
		}
	);

	NumberEditor.prototype.formatValue = function (sValue) {
		if (_isNil(sValue) || isValidBindingString(sValue, false)) {
			return sValue;
		}

		var nValue = parseFloat(sValue);
		if (!this.validateNumber(nValue)) {
			return sValue;
		}

		return this.getFormatterInstance().format(nValue);
	};

	NumberEditor.prototype._onLiveChange = function (oEvent) {
		// When a string arrives through editor, we assume the users locale was used
		var nValue = this._parseLocalized(oEvent.getParameter("newValue"));
		BasePropertyEditor.prototype.setValue.call(this, nValue);
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

	NumberEditor.prototype._parseLocalized = function (vValue) {
		if (!vValue || isValidBindingString(vValue, false)) {
			return vValue;
		}

		var nValue = this.getFormatterInstance().parse(vValue);
		return nValue;
	};

	return NumberEditor;
});
