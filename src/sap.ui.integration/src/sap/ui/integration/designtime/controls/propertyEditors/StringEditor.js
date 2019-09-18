/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/controls/propertyEditors/BasePropertyEditor",
	"sap/ui/base/BindingParser"
], function (
	BasePropertyEditor,
	BindingParser
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var StringEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.controls.propertyEditors.StringEditor", {
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);
			this._oInput = new sap.m.Input({value: "{value}"});
			this._oInput.attachLiveChange(function(oEvent) {
				if (this._validate()) {
					this.firePropertyChanged(this._oInput.getValue());
				}
			}.bind(this));
			this.addContent(this._oInput);
		},
		_validate: function(params) {
			var oValue = this._oInput.getValue();
			var bInvalidBindingString = false;
			try {
				BindingParser.complexParser(oValue);
			} catch (oError) {
				bInvalidBindingString = true;
			} finally {
				if (bInvalidBindingString) {
					this._oInput.setValueState("Error");
					this._oInput.setValueStateText(this.getI18nProperty("CARD_EDITOR.STRING.INVALID_BINDING"));
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
