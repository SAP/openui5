/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
	"sap/ui/core/format/NumberFormat"
], function (
	BasePropertyEditor,
	NumberEditor,
	NumberFormat
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>IntegerEditor</code>.
	 * This allows you to set integer values or binding paths for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.Input}, which prevents non-integer user input unless it is a valid binding path.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.integerEditor.IntegerEditor
	 * @author SAP SE
	 * @since 1.76
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.76
	 * @ui5-restricted
	 */
	var IntegerEditor = NumberEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.integerEditor.IntegerEditor", {
		invalidInputError: "BASE_EDITOR.INTEGER.INVALID_BINDING_OR_INTEGER",
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	IntegerEditor.prototype.validateNumber = function (vValue) {
		return NumberEditor.prototype.validateNumber.call(this, vValue) && Number.isInteger(vValue);
	};

	IntegerEditor.prototype.getFormatterInstance = function () {
		return NumberFormat.getIntegerInstance();
	};

	return IntegerEditor;
});
