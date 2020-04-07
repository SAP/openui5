/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/cardEditor/propertyEditor/complexMapEditor/ComplexMapEditor",
	"sap/base/util/restricted/_merge"
], function (
	BasePropertyEditor,
	ComplexMapEditor,
	_merge
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>DestinationsEditor</code>.
	 *
	 * <h3>Configuration</h3>
	 *
	 * Configuration is inherited from {@link sap.ui.integration.designtime.cardEditor.propertyEditor.complexMapEditor.ComplexMapEditor}
	 *
	 * <table style="width:100%;">
	 * <tr style="text-align:left">
	 * 	<th>Option</th>
	 * 	<th>Type</th>
	 * 	<th>Default</th>
	 * 	<th>Description</th>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowedValues</code></td>
	 *  <td><code>string[]</code></td>
	 * 	<td><code>[]</code></td>
	 * 	<td>Allowed destination values</td>
	 * </tr>
	 * </table>
	 *
	 * @extends sap.ui.integration.designtime.cardEditor.propertyEditor.complexMapEditor.ComplexMapEditor
	 * @alias sap.ui.integration.designtime.cardEditor.propertyEditor.destinationsEditor.DestinationsEditor
	 * @author SAP SE
	 * @since 1.77
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.77
	 * @ui5-restricted
	 */
	var DestinationsEditor = ComplexMapEditor.extend("sap.ui.integration.designtime.cardEditor.propertyEditor.destinationsEditor.DestinationsEditor", {
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	DestinationsEditor.prototype.setConfig = function (oConfig) {
		var oTemplate = {};

		if (oConfig["allowKeyChange"] !== false) {
			// Destination-specific developer scenario
			oTemplate = {
				label: {
					label: this.getI18nProperty("CARD_EDITOR.DESTINATION.LABEL"),
					type: "string",
					path: "label"
					// defaultValue: "${key}"
				},
				name: {
					label: this.getI18nProperty("CARD_EDITOR.DESTINATION.NAME"),
					type: "enum",
					path: "name",
					"enum": oConfig["allowedValues"] || [],
					allowCustomValues: true,
					allowBindings: false
				},
				defaultUrl: {
					label: this.getI18nProperty("CARD_EDITOR.DESTINATION.DEFAULT_URL"),
					type: "string",
					path: "defaultUrl"
				}
			};
		} else {
			// Config scenario
			oTemplate = {
				name: {
					label: "{= ${label} || ${key}}",
					type: "enum",
					path: "name",
					"enum": oConfig["allowedValues"] || [],
					allowCustomValues: false,
					allowBindings: false
				}
			};
		}

		var oComplexMapConfig = _merge(
			{},
			{
				template: oTemplate
			},
			oConfig
		);

		ComplexMapEditor.prototype.setConfig.call(this, oComplexMapConfig);
	};

	return DestinationsEditor;
});