/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString"
], function (
	BasePropertyEditor,
	isValidBindingString
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>EnumStringEditor</code>.
	 * This allows to select from predefined string values or to provide binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.ComboBox}.
	 * To get notified about changes made with the editor, you can use the <code>attachValueChange</code> method,
	 * which passes the current property state as a string representing a valid option value or as a binding string to the provided callback function when the user selects a value or edits the input.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.enumStringEditor.EnumStringEditor
	 * @author SAP SE
	 * @since 1.70
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.70
	 * @ui5-restricted
	 */
	var EnumStringEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.enumStringEditor.EnumStringEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.enumStringEditor.EnumStringEditor",
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	EnumStringEditor.prototype._onChange = function () {
		var oComboBox = this.getContent();
		var sSelectedKey = oComboBox.getSelectedKey();
		var sValue = oComboBox.getValue();
		var sError = this._validate(sSelectedKey, sValue);
		if (!sError) {
			this.setValue(sSelectedKey || sValue);
			this._setInputState(true);
		} else {
			this._setInputState(false, this.getI18nProperty(sError));
		}
	};

	EnumStringEditor.prototype._validate = function (sSelectedKey, sValue) {
		var oConfig = this.getConfig();
		if (oConfig["allowBindings"] === false && isValidBindingString(sValue, false)) {
			return "BASE_EDITOR.ENUM.BINDING_NOT_ALLOWED";
		}
		if (!oConfig["allowCustomValues"] && sValue && !sSelectedKey && !isValidBindingString(sValue, false)) {
			return "BASE_EDITOR.ENUM.CUSTOM_VALUES_NOT_ALLOWED";
		}
		if (!isValidBindingString(sValue)) {
			return "BASE_EDITOR.ENUM.INVALID_SELECTION";
		}
	};

	EnumStringEditor.prototype._setInputState = function (bIsValid, sErrorMessage) {
		var oComboBox = this.getContent();
		if (bIsValid) {
			oComboBox.setValueState("None");
		} else {
			oComboBox.setValueState("Error");
			oComboBox.setValueStateText(sErrorMessage);
		}
	};

	return EnumStringEditor;
});