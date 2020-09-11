/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/editor/fields/BaseField",
	"sap/m/Input",
	"sap/m/Text"
], function (
	BaseField, Input, Text
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