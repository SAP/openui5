/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/controls/propertyEditors/BasePropertyEditor",
	"sap/ui/core/Item",
	"sap/ui/base/BindingParser"
], function (
	BasePropertyEditor,
	Item,
	BindingParser
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var EnumStringEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.controls.propertyEditors.EnumStringEditor", {
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);
			this._oCombo = new sap.m.ComboBox({
				selectedKey: "{value}",
				value: "{value}",
				width: "100%"
			});
			this._oCombo.bindAggregation("items", "enum", function(sId, oContext) {
				return new Item({
					key: oContext.getObject(),
					text: oContext.getObject()
				});
			});
			this._oCombo.attachChange(function() {
				if (this._validate()) {
					this.firePropertyChanged(this._oCombo.getSelectedKey() || this._oCombo.getValue());
				}
			}.bind(this));
			this.addContent(this._oCombo);
		},
		_validate: function() {
			var sSelectedKey = this._oCombo.getSelectedKey();
			var sValue = this._oCombo.getValue();

			if (!sSelectedKey && sValue) {
				var oParsedValue;
				try {
					oParsedValue = BindingParser.complexParser(sValue);
				} finally {
					if (!oParsedValue) {
						this._oCombo.setValueState("Error");
						this._oCombo.setValueStateText(this.getI18nProperty("CARD_EDITOR.ENUM.INVALID_SELECTION_OR_BINDING"));
						return false;
					} else {
						this._oCombo.setValueState("None");
						return true;
					}
				}
			} else {
				this._oCombo.setValueState("None");
				return true;
			}
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return EnumStringEditor;
});