/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/m/Input"
], function (
	BaseField, Input
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.NumberField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var NumberField = BaseField.extend("sap.ui.integration.editor.fields.NumberField", {
		metadata: {
			library: "sap.ui.integration"
		},
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
					change: function (oEvent) {
						var oSource = oEvent.getSource();
						oSource.getBinding("value").setValue(oSource.getValue());
						oSource.getBinding("value").checkUpdate();
					},
					editable: oConfig.editable,
					type: "Number"
				}
			};
		}
		this._visualization = oVisualization;
	};

	return NumberField;
});