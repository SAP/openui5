/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/restricted/_isNil",
	"sap/base/util/isPlainObject"
], function (
	BasePropertyEditor,
	_isNil,
	isPlainObject
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
	 * 	<td><code>enabled</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether the underlying control should be enabled</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowBindings</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether binding strings can be set instead of selecting items</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>placeholder</code></td>
	 *  <td><code>string</code></td>
	 * 	<td></td>
	 * 	<td>Placeholder for the input field</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>maxLength</code></td>
	 *  <td><code>number</code></td>
	 * 	<td></td>
	 * 	<td>Maximum number of characters</td>
	 * </tr>
	 * </table>
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
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	StringEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		typeLabel: {
			defaultValue: "BASE_EDITOR.TYPES.STRING"
		},
		enabled: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		allowBindings: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		}
	});

	StringEditor.prototype.getDefaultValidators = function () {
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
				maxLength: {
					type: "maxLength",
					isEnabled: typeof oConfig.maxLength === "number",
					config: {
						maxLength: oConfig.maxLength
					}
				}
			}
		);
	};

	StringEditor.prototype.setValue = function (vValue) {
		if (!_isNil(vValue) && !isPlainObject(vValue)) {
			arguments[0] = vValue.toString();
		}
		BasePropertyEditor.prototype.setValue.apply(this, arguments);
	};

	StringEditor.prototype._onLiveChange = function () {
		var oInput = this.getContent();
		this.setValue(oInput.getValue());
	};

	return StringEditor;
});
