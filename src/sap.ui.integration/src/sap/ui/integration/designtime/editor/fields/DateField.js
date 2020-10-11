/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/editor/fields/BaseField",
	"sap/m/DatePicker"
], function (
	BaseField, DatePicker
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.designtime.editor.fields.BaseField
	 * @alias sap.ui.integration.designtime.editor.fields.DateField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var DateField = BaseField.extend("sap.ui.integration.designtime.editor.fields.DateField", {
		renderer: BaseField.getMetadata().getRenderer()
	});

	DateField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			oVisualization = {
				type: DatePicker,
				settings: {
					dateValue: {
						path: 'currentSettings>value', formatter: function (v) {
							return new Date(v);
						}
					},
					editable: { path: 'currentSettings>editable' },
					valueFormat: "YYYY-MM-dd",
					width: "16rem",
					change: function (oEvent) {
						if (oEvent.getParameters().valid) {
							//always store an ISO string, but from 00:00:00 of the real date selected.
							//dateValue would produce a UTC based ISO string.
							//getValue will contain string base on valueVormat and therefore can be put to setRawValue
							var oSource = oEvent.getSource();
							oSource.getBinding("dateValue").setRawValue(oSource.getValue());
							oSource.getBinding("dateValue").checkUpdate();
						} else {
							//TODO:show an error
							var oSource = oEvent.getSource();
							oSource.getBinding("dateValue").setRawValue("");
						}
					}
				}
			};
		}
		this._visualization = oVisualization;
	};

	return DateField;
});