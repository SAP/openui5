/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/restricted/_isNil"
], function (
	BasePropertyEditor,
	_isNil
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>TextAreaEditor</code>.
	 * This allows to set a code editor or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.TextArea}.
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
	 * 	<td><code>type</code></td>
	 *  <td><code>string</code></td>
	 * 	<td><code>json</code></td>
	 * 	<td>The type of the code in the editor used for syntax highlighting</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowBindings</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether binding strings can be set instead of selecting items</td>
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
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.textAreaEditor.TextAreaEditor
	 * @author SAP SE
	 * @since 1.85
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.85
	 * @ui5-restricted
	 */
	var TextAreaEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.textAreaEditor.TextAreaEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.textAreaEditor.TextAreaEditor",
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	TextAreaEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		allowBindings: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		typeLabel: {
			defaultValue: "BASE_EDITOR.TYPES.OBJECT"
		}
	});

	TextAreaEditor.prototype.getDefaultValidators = function () {
		var oConfig = this.getConfig();
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidators.call(this),
			{
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

	TextAreaEditor.prototype.formatValue = function (vValue) {
		vValue = JSON.stringify(vValue, null, "\t");
		if (typeof vValue === "object" && !vValue.length) {
			vValue = vValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
				return s.substring(3, s.length - 3);
			});
		}
		return vValue;
	};

	TextAreaEditor.prototype._onLiveChange = function () {
		var oTextArea = this.getContent();
		var sValue = oTextArea.getValue();
		if (!sValue || sValue === "") {
			this.setValue(undefined);
		} else {
			try {
				var oValue = JSON.parse(sValue);
				this.setValue(oValue);
			} catch (e) {
				oTextArea.setValueState("Error");
				oTextArea.setValueStateText(this.getI18nProperty("BASE_EDITOR.VALIDATOR.NOT_A_JSONOBJECT"));
			}
		}
	};

	return TextAreaEditor;
});
