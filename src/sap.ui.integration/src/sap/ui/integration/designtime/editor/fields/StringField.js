/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/editor/fields/BaseField",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/Select",
	"sap/m/ComboBox",
	"sap/ui/core/ListItem"
], function (
	BaseField, Input, Text, Select, ComboBox, ListItem
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.designtime.editor.fields.BaseField
	 * @alias sap.ui.integration.designtime.editor.fields.StringField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var StringField = BaseField.extend("sap.ui.integration.designtime.editor.fields.StringField", {
		renderer: BaseField.getMetadata().getRenderer()
	});

	StringField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			if (oConfig.editable) {
				if (oConfig.values) {
					var oItem = new ListItem(oConfig.values.item);
					oVisualization = {
						type: Select,
						settings: {
							selectedKey: {
								path: 'currentSettings>value'
							},
							editable: oConfig.editable,
							showSecondaryValues: true,
							width: "100%",
							items: {
								path: "", //empty, because the bindingContext for the undefined model already points to the path
								template: oItem
							}
						}
					};
				} else {
					oVisualization = {
						type: Input,
						settings: {
							value: {
								path: 'currentSettings>value'
							},
							editable: oConfig.editable,
							placeholder: oConfig.placeholder
						}
					};
				}
			} else {
				oVisualization = {
					type: Text,
					settings: {
						text: {
							path: 'currentSettings>value'
						},
						wrapping: false
					}
				};
			}
		}
		this._visualization = oVisualization;
	};

	return StringField;
});