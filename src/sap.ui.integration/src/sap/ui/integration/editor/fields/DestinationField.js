/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/ui/core/ListItem",
	"sap/m/ComboBox",
	"sap/ui/model/Sorter"
], function (
	BaseField, ListItem, ComboBox, Sorter
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.DestinationField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var DestinationField = BaseField.extend("sap.ui.integration.editor.fields.DestinationField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	DestinationField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			oVisualization = {
				type: ComboBox,
				settings: {
					busy: { path: 'destinations>_loading' },
					selectedKey: { path: 'currentSettings>value' },
					width: "100%",
					editable: { path: 'currentSettings>editable' },
					items: {
						path: "destinations>_values",
						template: new ListItem({
							text: "{destinations>name}",
							key: "{destinations>name}"
						}),
						sorter: [new Sorter({
							path: 'name'
						})]
					}
				}
			};
		}
		this._visualization = oVisualization;
	};

	return DestinationField;
});