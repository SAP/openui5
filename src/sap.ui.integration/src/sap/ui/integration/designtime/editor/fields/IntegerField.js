/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/editor/fields/BaseField",
	"sap/m/Input",
	"sap/ui/model/type/Integer"
], function (
	BaseField, Input, IntType
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.designtime.editor.fields.BaseField
	 * @alias sap.ui.integration.designtime.editor.fields.IntegerField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var IntegerField = BaseField.extend("sap.ui.integration.designtime.editor.fields.IntegerField", {
		renderer: BaseField.getMetadata().getRenderer()
	});
	IntegerField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			oVisualization = {
				type: Input,
				settings: {
					value: { path: 'currentSettings>value', type: new IntType() },
					editable: { path: 'currentSettings>editable' },
					type: "Number"
				}
			};
		}
		this._visualization = oVisualization;
	};

	return IntegerField;
});