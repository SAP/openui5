/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/m/ComboBox",
	"sap/ui/core/Item",
	"sap/ui/base/BindingParser"
], function (
	BasePropertyEditor,
	ComboBox,
	Item,
	BindingParser
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>EnumStringEditor</code>.
	 * This allows to select from predefined string values or to provide binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.ComboBox}.
	 * To get notified about changes made with the editor, you can use the <code>attachPropertyChange</code> method,
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
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);
			this._oCombo = new ComboBox({
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
					this.firePropertyChange(this._oCombo.getSelectedKey() || this._oCombo.getValue());
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
						this._oCombo.setValueStateText(this.getI18nProperty("BASE_EDITOR.ENUM.INVALID_SELECTION_OR_BINDING"));
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