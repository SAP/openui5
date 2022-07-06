/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor"
], function (
	BasePropertyEditor
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
	 * <h3>Configuration</h3>
	 *
	 * <table style="width:100%;">
	 * <tr style="text-align:left">
	 * 	<th>Option</th>
	 * 	<th>Type</th>
	 * 	<th>Default</th>
	 * 	<th>Description</th>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowCustomValues</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>false</code></td>
	 * 	<td>Whether custom values can be set instead of selecting items</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowBindings</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether binding strings can be set instead of selecting items</td>
	 * </tr>
	 * </table>
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.enumStringEditor.EnumStringEditor
	 * @author SAP SE
	 * @since 1.70
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.70
	 * @deprecated as of version 1.81. Use the {@link sap.ui.integration.designtime.baseEditor.propertyEditor.selectEditor.SelectEditor} instead
	 * @ui5-restricted
	 */
	var EnumStringEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.enumStringEditor.EnumStringEditor", {
		metadata: {
			library: "sap.ui.integration",
			deprecated: true
		},
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.enumStringEditor.EnumStringEditor",
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	EnumStringEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		allowBindings: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		allowCustomValues: {
			defaultValue: false,
			mergeStrategy: "mostRestrictiveWins",
			mostRestrictiveValue: true
		}
	});

	EnumStringEditor.prototype.getDefaultValidators = function () {
		var oConfig = this.getConfig();
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidators.call(this),
			{
				isValidBinding: {
					type: "isValidBinding",
					isEnabled: oConfig.allowBindings
				},
				notABinding: {
					type: "notABinding",
					isEnabled: !oConfig.allowBindings
				},
				isSelectedKey: {
					type: "isSelectedKey",
					config: {
						keys: function (oPropertyEditor) {
							return oPropertyEditor.getConfig().enum;
						}
					},
					isEnabled: !oConfig.allowCustomValues
				}
			}
		);
	};

	EnumStringEditor.prototype._onChange = function () {
		var oComboBox = this.getContent();
		var sSelectedKey = oComboBox.getSelectedKey();
		var sValue = oComboBox.getValue();
		this.setValue(sSelectedKey || sValue);
	};

	return EnumStringEditor;
});