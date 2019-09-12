/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/controls/PropertyEditor",
	"sap/ui/base/BindingParser"
], function (
	PropertyEditor,
	BindingParser
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var StringEditor = PropertyEditor.extend("sap.ui.integration.designtime.controls.propertyEditors.StringEditor", {
		init: function() {
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
		renderer: PropertyEditor.getMetadata().getRenderer().render
	});

	return StringEditor;
});
