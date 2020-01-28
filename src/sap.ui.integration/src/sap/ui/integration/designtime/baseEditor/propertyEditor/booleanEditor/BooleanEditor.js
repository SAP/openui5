/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/base/BindingParser"
], function (
	BasePropertyEditor,
	BindingParser
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>BooleanEditor</code>.
	 * This allows you to set boolean values or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.ComboBox}.
	 * To get notified about changes made with the editor, you can use the <code>attachValueChange</code> method,
	 * which passes the current property state as a boolean or binding string to the provided callback function when the state changes.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.booleanEditor.BooleanEditor
	 * @author SAP SE
	 * @since 1.72
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.72
	 * @ui5-restricted
	 */
	var BooleanEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.booleanEditor.BooleanEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.booleanEditor.BooleanEditor",

		_onChange: function() {
			var bInput = this._validate();
			if (bInput !== null) {
				this.fireValueChange(bInput);
			}
		},

		_validate: function() {
			var oCombo = this.getContent();
			var sSelectedKey = oCombo.getSelectedKey();
			var sValue = oCombo.getValue();

			try {
				var oParsed = BindingParser.complexParser(sValue);
				if (!oParsed && !sSelectedKey && sValue) {
					throw "Not a boolean";
				}
				oCombo.setValueState("None");
				if (sSelectedKey) {
					return sSelectedKey === "true";
				}
				return sValue;
			} catch (vError) {
				oCombo.setValueState("Error");
				oCombo.setValueStateText(this.getI18nProperty("BASE_EDITOR.BOOLEAN.INVALID_BINDING_OR_BOOLEAN"));
				return null;
			}
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return BooleanEditor;
});
