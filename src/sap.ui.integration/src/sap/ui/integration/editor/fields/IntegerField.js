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
	 * @alias sap.ui.integration.editor.fields.IntegerField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var IntegerField = BaseField.extend("sap.ui.integration.editor.fields.IntegerField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	IntegerField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		var oFormatter = oConfig.formatter;
		if (!oVisualization) {
			oVisualization = {
				type: Input,
				settings: {
					value: {
						path: 'currentSettings>value',
						type: 'sap.ui.model.type.Integer',
						formatOptions: oFormatter
					},
					editable: oConfig.editable,
					type: "Number",
					parseError: function (oEvent) {
						var oControl = oEvent.getSource(),
						errorMsg = null;
						if (oControl.getValue() !== "") {
							if (oEvent.getParameters() && oEvent.getParameters().exception && oEvent.getParameters().exception.message) {
								errorMsg = oEvent.getParameters().exception.message;
							} else {
								errorMsg = oEvent.getId();
							}
							oControl.getParent()._showValueState("error", errorMsg);
						} else {
							oControl.getParent()._showValueState("none", "");
						}
					}
				}
			};
		} else if (oVisualization.type === "Slider") {
			oVisualization.type = "sap/m/Slider";
		}
		this._visualization = oVisualization;
	};

	return IntegerField;
});