/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/core/Item",
	"sap/ui/base/BindingParser"
], function (
	BasePropertyEditor,
	Item,
	BindingParser
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

		_onChange: function() {
			var oCombo = this.getContent();
			if (this._validate()) {
				this.setValue(oCombo.getSelectedKey() || oCombo.getValue());
			}
		},

		_validate: function() {
			var oCombo = this.getContent();
			var sSelectedKey = oCombo.getSelectedKey();
			var sValue = oCombo.getValue();

			if (!sSelectedKey && sValue) {
				var oParsedValue;
				try {
					oParsedValue = BindingParser.complexParser(sValue);
				} finally {
					if (!oParsedValue) {
						oCombo.setValueState("Error");
						oCombo.setValueStateText(this.getI18nProperty("BASE_EDITOR.ENUM.INVALID_SELECTION_OR_BINDING"));
						return false;
					} else {
						oCombo.setValueState("None");
						return true;
					}
				}
			} else {
				oCombo.setValueState("None");
				return true;
			}
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return EnumStringEditor;
});