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
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	DestinationsEditor.configMetadata = Object.assign({}, ComplexMapEditor.configMetadata, {
		allowedValues: {
			defaultValue: [],
			mergeStrategy: "intersection"
		}
	});

	DestinationsEditor.prototype.onBeforeConfigChange = function (oConfig) {
		var oCustomConfig = {};

		if (oConfig["allowKeyChange"]) {
			// Destination-specific developer scenario
			oCustomConfig = {
				template: {
					label: {
						label: this.getI18nProperty("CARD_EDITOR.LABEL"),
						type: "string",
						path: "label"
					},
					name: {
						label: this.getI18nProperty("CARD_EDITOR.DESTINATION.NAME"),
						type: "select",
						path: "name",
						items: (oConfig["allowedValues"] || []).map(function(sKey){ return { key: sKey }; }),
						allowCustomValues: true,
						allowBindings: false
					},
					defaultUrl: {
						label: this.getI18nProperty("CARD_EDITOR.DESTINATION.DEFAULT_URL"),
						type: "string",
						path: "defaultUrl"
					}
				}
			};
		} else {
			// Config scenario
			oCustomConfig = {
				collapsibleItems: false,
				showItemLabel: false,
				template: {
					name: {
						label: "{= ${label} || ${key}}",
						type: "select",
						path: "name",
						items: (oConfig["allowedValues"] || []).map(function(sKey){ return { key: sKey }; }),
						allowCustomValues: false,
						allowBindings: false
					}
				}
			};
		}

		var oComplexMapConfig = _merge(
			{},
			oCustomConfig,
			oConfig
		);
		return ComplexMapEditor.prototype.onBeforeConfigChange.call(this, oComplexMapConfig);
	};

	return DestinationsEditor;
});