/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/cardEditor/propertyEditor/complexMapEditor/ComplexMapEditor",
	"sap/base/util/restricted/_merge",
	"sap/ui/integration/cards/filters/DateRangeFilter"
], function (
	BasePropertyEditor,
	ComplexMapEditor,
	_merge,
	DateRangeFilter
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>FiltersEditor</code>.
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
	 * 	<td><code>allowedTypes</code></td>
	 *  <td><code>string[]</code></td>
	 * 	<td><code>[]</code></td>
	 * 	<td>Allowed filter types</td>
	 * </tr>
	 * </table>
	 *
	 * @extends sap.ui.integration.designtime.cardEditor.propertyEditor.complexMapEditor.ComplexMapEditor
	 * @alias sap.ui.integration.designtime.cardEditor.propertyEditor.filtersEditor.FiltersEditor
	 * @author SAP SE
	 * @since 1.98
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.97
	 * @ui5-restricted
	 */
	var FiltersEditor = ComplexMapEditor.extend("sap.ui.integration.designtime.cardEditor.propertyEditor.filtersEditor.FiltersEditor", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	FiltersEditor.configMetadata = Object.assign({}, ComplexMapEditor.configMetadata, {
		allowedValues: {
			defaultValue: [],
			mergeStrategy: "intersection"
		}
	});

	FiltersEditor.prototype.onBeforeConfigChange = function (oConfig) {
		var oCustomConfig = {};

		if (oConfig["allowKeyChange"]) {
			// Filter-specific developer scenario
			oCustomConfig = {
				template: {
					key: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.KEY"),
						path: "key",
						type: "string",
						enabled: oConfig.allowKeyChange,
						allowBindings: false,
						validators: [
							{
								type: "isUniqueKey",
								config: {
									keys: function () {
										return Object.keys(this.getValue());
									}.bind(this),
									currentKey: function (oPropertyEditor) {
										return oPropertyEditor.getValue();
									}
								}
							}
						]
					},
					type: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.TYPE"),
						path: "type",
						type: "select",
						items: (oConfig["allowedTypes"] || []).map(function(sKey){ return { key: sKey }; }),
						allowCustomValues: true,
						allowBindings: false
					},
					label: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.LABEL"),
						path: "label",
						type: "string"
					},
					description: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.DESCRIPTION"),
						type: "string",
						path: "description",
						visible: "{= ${type} === 'Select' || ${type} === 'DateRange'}",
						allowCustomValues: true,
						allowBindings: false
					},
					value: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.NORMALVALUE"),
						// label: "{= ${type} === 'Select' ? ${i18n>CARD_EDITOR.FILTER.NORMALVALUE} : ${i18n>CARD_EDITOR.FILTER.VALUE} }",
						path: "sValue",
						type: "string",
						visible: "{= ${type} === 'Select'}"
					},
					placeholder: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.PLACEHOLDER"),
						path: "placeholder",
						type: "string",
						visible: "{= ${type} === 'Search'}"
					},
					itemPath: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.ITEM.PATH"),
						path: "item/path",
						type: "string",
						visible: "{= ${type} === 'Select'}",
						enabled: "{= ${items} === undefined || ${items} === null}"
					},
					itemTemplateKey: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.ITEM.TEMPLATE.KEY"),
						path: "item/template/key",
						type: "string",
						visible: "{= ${type} === 'Select'}",
						enabled: "{= ${items} === undefined || ${items} === null}"
					},
					itemTemplateTitle: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.ITEM.TEMPLATE.TITLE"),
						path: "item/template/title",
						type: "string",
						visible: "{= ${type} === 'Select'}",
						enabled: "{= ${items} === undefined || ${items} === null}"
					},
					itemData: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.ITEM.DATA"),
						path: "data",
						type: "json",
						visible: "{= ${type} === 'Select'}",
						enabled: "{= ${items} === undefined || ${items} === null}"
					},
					items: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.ITEMS"),
						path: "items",
						type: "json",
						visible: "{= ${type} === 'Select'}",
						enabled: "{= ${item/template/key} === undefined || ${item/template/key} === ''}"
					},
					dateRangeOptions: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.OPTIONS"),
						path: "options",
						type: "multiSelect",
						items: this.getAllDateRangeOptions(),
						visible: "{= ${type} === 'DateRange'}"
					},
					dateRangeValueOption: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.VALUE.OPTION"),
						path: "dValue/option",
						type: "select",
						items: "{selectedOptions}",
						visible: "{= ${type} === 'DateRange'}"
					},
					dateRangeValues: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.VALUE.VALUES"),
						path: "dValue/values",
						type: "textArea",
						visible: "{= ${type} === 'DateRange'}"
					}
				}
			};
		} else {
			// Config scenario
			oCustomConfig = {
				collapsibleItems: false,
				showItemLabel: false,
				template: {
					type: {
						label: this.getI18nProperty("CARD_EDITOR.FILTER.TYPE"),
						type: "select",
						path: "type",
						items: (oConfig["allowedTypes"] || []).map(function(sKey){ return { key: sKey }; }),
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

	FiltersEditor.prototype.getAllDateRangeOptions = function() {
		var dateRangeFilter = new DateRangeFilter();
		var oOptions = dateRangeFilter.getOptions();
		var optionsArray = [];
		for (var key in oOptions) {
			if (oOptions.hasOwnProperty(key)) {
				optionsArray.push({
					key: oOptions[key],
					title: oOptions[key]
				});
			}
		}
		return optionsArray;
	};

	return FiltersEditor;
});