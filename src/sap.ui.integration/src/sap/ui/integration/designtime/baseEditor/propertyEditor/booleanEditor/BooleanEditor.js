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
	 * Constructor for a new <code>BooleanEditor</code>.
	 * This allows you to set boolean values or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.ComboBox}.
	 * To get notified about changes made with the editor, you can use the <code>attachPropertyChange</code> method,
	 * which passes the current property state as a boolean or binding string to the provided callback function when the state changes.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.booleanEditor.BooleanEditor
	 * @author SAP SE
	 * @since 1.72
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 * @ui5-restricted
	 */
	var BooleanEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.booleanEditor.BooleanEditor", {
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);
			this._oCombo = new ComboBox({
				selectedKey: "{value}",
				value: "{value}",
				width: "100%",
				items: [true, false].map(
					function (bOption) {
						return new Item({
							key: bOption,
							text: String(bOption)
						});
					}
				)
			});
			this._oCombo.attachChange(function() {
				var bInput = this._validate();
				if (bInput !== null) {
					this.firePropertyChange(bInput);
				}
			}, this);
			this.addContent(this._oCombo);
		},
		_validate: function() {
			var sSelectedKey = this._oCombo.getSelectedKey();
			var sValue = this._oCombo.getValue();

			try {
				var oParsed = BindingParser.complexParser(sValue);
				if (!oParsed && !sSelectedKey && sValue) {
					throw "Not a boolean";
				}
				this._oCombo.setValueState("None");
				if (sSelectedKey) {
					return sValue === 'true';
				}
				return sValue;
			} catch (vError) {
				this._oCombo.setValueState("Error");
				this._oCombo.setValueStateText(this.getI18nProperty("BASE_EDITOR.BOOLEAN.INVALID_BINDING_OR_BOOLEAN"));
				return null;
			}
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return BooleanEditor;
});
