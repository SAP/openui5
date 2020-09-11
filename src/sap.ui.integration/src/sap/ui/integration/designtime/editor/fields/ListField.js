/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/editor/fields/BaseField",
	"sap/m/Select",
	"sap/ui/core/ListItem"

], function (
	BaseField, Select, ListItem
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.designtime.editor.fields.BaseField
	 * @alias sap.ui.integration.designtime.editor.fields.ListField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var ListField = BaseField.extend("sap.ui.integration.designtime.editor.fields.ListField", {
		renderer: BaseField.getMetadata().getRenderer()
	});

	ListField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			oVisualization = {
				type: Select,
				settings: {
					selectedKey: { path: 'currentSettings>value' },
					width: "100%",
					items: {
						path: "currentSettings>_values", template: new ListItem({
							text: "{currentSettings>}",
							key: "{currentSettings>}"
						})

					}
				}
			};
		}
		this._visualization = oVisualization;
	};
	return ListField;
});