/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/m/DatePicker"
], function (
	BaseField, DatePicker
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.DateField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var DateField = BaseField.extend("sap.ui.integration.editor.fields.DateField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	DateField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		var oformatter = oConfig.formatter;
		if (oConfig.value !== "") {
			oConfig.value = new Date(oConfig.value);
		}
		if (!oVisualization) {
			oVisualization = {
				type: DatePicker,
				settings: {
					value: {
						path: "currentSettings>value",
						type: 'sap.ui.model.type.Date',
						formatOptions: oformatter
					},
					editable: oConfig.editable,
					//width: "16rem",
					width: "100%",
					change: function (oEvent) {
						if (oEvent.getParameters().valid) {
							//always store an ISO string, but from 00:00:00 of the real date selected.
							//dateValue would produce a UTC based ISO string.
							//getValue will contain string base on valueVormat and therefore can be put to setRawValue
							var oSource = oEvent.getSource();
							oSource.getBinding("value").setValue(oSource.getDateValue());
							oSource.getBinding("value").checkUpdate();
						} else {
							//TODO:show an error
							var oSource = oEvent.getSource();
							oSource.getBinding("value").setValue("");
						}
					}
				}
			};
		}
		this._visualization = oVisualization;
	};

	return DateField;
});