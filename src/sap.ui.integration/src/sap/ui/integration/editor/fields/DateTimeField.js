/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/m/DateTimePicker",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/type/DateTime"
], function (
	BaseField, DateTimePicker, UI5Date, DateTimeType
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.DateTimeField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var DateTimeField = BaseField.extend("sap.ui.integration.editor.fields.DateTimeField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	DateTimeField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		var oformatter = oConfig.formatter;
		if (oConfig.value !== "") {
			oConfig.value = UI5Date.getInstance(oConfig.value);
		}
		if (!oVisualization) {
			oVisualization = {
				type: DateTimePicker,
				settings: {
					value: {
						path: "currentSettings>value",
						type: new DateTimeType(oformatter)
					},
					editable: oConfig.editable,
					//width: "16rem",
					width: "100%",
					change: function (oEvent) {
						if (oEvent.getParameters().valid) {
							var oSource = oEvent.getSource();
							oSource.getBinding("value").setValue(oSource.getDateValue().toISOString());
							oSource.getBinding("value").checkUpdate();
						} else {
							//TODO:show an error
							var oSource = oEvent.getSource();
							oSource.getBinding("value").setValue("");
							oSource.getBinding("value").checkUpdate(true);
						}
					}
				}
			};
		}
		this._visualization = oVisualization;
	};

	return DateTimeField;
});