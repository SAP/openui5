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
	 * Constructor for a new <code>SeparatorEditor</code>.
	 * This allows to add a separator between parameters.
	 * The editor is rendered as a {@link sap.m.ToolbarSpacer}.
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
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.separatorEditor.SeparatorEditor
	 * @author SAP SE
	 * @since 1.91
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.91
	 * @ui5-restricted
	 */
	var SeparatorEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.separatorEditor.SeparatorEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.separatorEditor.SeparatorEditor",
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	SeparatorEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		allowBindings: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		typeLabel: {
			defaultValue: "BASE_EDITOR.TYPES.SEPARATOR"
		}
	});

	SeparatorEditor.prototype.getDefaultValidators = function () {
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

	return SeparatorEditor;
});
