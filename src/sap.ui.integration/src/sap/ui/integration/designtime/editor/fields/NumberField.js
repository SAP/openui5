/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/editor/fields/BaseField",
	"sap/m/Input"
], function (
	BaseField, Input
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.designtime.editor.fields.BaseField
	 * @alias sap.ui.integration.designtime.editor.fields.NumberField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var NumberField = BaseField.extend("sap.ui.integration.designtime.editor.fields.NumberField", {
		renderer: BaseField.getMetadata().getRenderer()
	});
	NumberField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		var oFormatter = oConfig.formatter;
		if (!oVisualization) {
			oVisualization = {
				type: Input,
				settings: {
					value: {
						path: 'currentSettings>value',
						type: 'sap.ui.model.type.Float',
						formatOptions: oFormatter
					},
					editable: oConfig.editable
				}
			};
		}
		this._visualization = oVisualization;
	};

	return NumberField;
});