/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/base/BindingParser",
	"sap/m/Input"
], function (
	BasePropertyEditor,
	BindingParser,
	Input
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>StringEditor</code>.
	 * This allows to set string values or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.Input}.
	 * To get notified about changes made with the editor, you can use the <code>attachPropertyChange</code> method,
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
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);
			this._oInput = new Input({value: "{value}"});
			this._oInput.attachLiveChange(function(oEvent) {
				if (this._validate()) {
					this.firePropertyChange(this._oInput.getValue());
				}
			}.bind(this));
			this.addContent(this._oInput);
		},
		_validate: function() {
			var oValue = this._oInput.getValue();
			var bInvalidBindingString = false;
			try {
				BindingParser.complexParser(oValue);
			} catch (oError) {
				bInvalidBindingString = true;
			} finally {
				if (bInvalidBindingString) {
					this._oInput.setValueState("Error");
					this._oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.STRING.INVALID_BINDING"));
					return false;
				} else {
					this._oInput.setValueState("None");
					return true;
				}
			}
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return StringEditor;
});
