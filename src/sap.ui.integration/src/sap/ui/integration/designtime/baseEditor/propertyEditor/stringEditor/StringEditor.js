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
	 * Constructor for a new <code>StringEditor</code>.
	 * This allows to set string values or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.Input}.
	 * To get notified about changes made with the editor, you can use the <code>attachValueChange</code> method,
	 * which passes the current property state as a string or binding string to the provided callback function when the user edits the input.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.stringEditor.StringEditor
	 * @author SAP SE
	 * @since 1.70
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.70
	 * @ui5-restricted
	 */
	var StringEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.stringEditor.StringEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.stringEditor.StringEditor",
		_onLiveChange: function() {
			var oInput = this.getContent();
			if (this._validate()) {
				this.setValue(oInput.getValue());
			}
		},
		_validate: function() {
			var oInput = this.getContent();
			var sValue = oInput.getValue();
			if (!isValidBindingString(sValue)) {
				oInput.setValueState("Error");
				oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.STRING.INVALID_BINDING"));
				return false;
			} else {
				oInput.setValueState("None");
				return true;
			}
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return StringEditor;
});
