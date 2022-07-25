/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_merge",
	"sap/base/util/deepClone",
	"sap/ui/integration/cards/filters/DateRangeFilter"
], function (
	BasePropertyEditor,
	_omit,
	_merge,
	deepClone,
	DateRangeFilter
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>ComplexMapEditor</code> for editing key-value pairs with object values.
	 *
	 * <h3>Configuration</h3>
	 *
	 * <table style="width:100%;">
	 * <tr style="text-align:left">
	 * 	<th>Option</th>
	 * 	<th>Type</th>
	 * 	<th>Default</th>
	 * 	<th>Description</th>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowKeyChange</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether to render an editor for the key attribute of map entries</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowAddAndRemove</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether to allow adding and removing map entries</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>keyLabel</code></td>
	 *  <td><code>string</code></td>
	 * 	<td><code>"Key"</code></td>
	 * 	<td>The label to show for the <code>key</code> field. Default is the localized string "Key".</td>
	 * </tr>
	 * </table>
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.cardEditor.propertyEditor.complexMapEditor.ComplexMapEditor
	 * @author SAP SE
	 * @since 1.76
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.76
	 * @ui5-restricted
	 */
	var ComplexMapEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.cardEditor.propertyEditor.complexMapEditor.ComplexMapEditor", {
		xmlFragment: "sap.ui.integration.designtime.cardEditor.propertyEditor.complexMapEditor.ComplexMapEditor",
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	ComplexMapEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		allowKeyChange: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		allowAddAndRemove: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		keyLabel: {
			defaultValue: "{i18n>CARD_EDITOR.COMPLEX_MAP.KEY}"//this.getI18nProperty("CARD_EDITOR.COMPLEX_MAP.KEY")
		}
	});

	ComplexMapEditor.prototype.getExpectedWrapperCount = function () {
		return 1;
	};

	ComplexMapEditor.prototype.onFragmentReady = function () {
		this._oNestedArrayEditor = this.getContent();

		this._oNestedArrayEditor.attachValueChange(function (oEvent) {
			var aPreviousValues = oEvent.getParameter("previousValue") || [];
			var aValues = deepClone(oEvent.getParameter("value") || []);
			var oNewDesigntimeMetadata = {};
			var aDesigntimeProperties = this.getDesigntimeProperties();

			aValues = aValues.map(function (oValue, iIndex) {
				if (typeof oValue.key === "undefined") {
					var sKey = "key";
					var iNextIndex = 0;
					var fnCheckDuplicateKey = function (oExistingValue) {
						return oExistingValue.key === sKey;
					};
					while (aValues.some(fnCheckDuplicateKey)) {
						sKey = "key" + ++iNextIndex;
					}
					oValue.key = sKey;
				}

				// Set designtime values
				var oNestedMetadata = {};
				aDesigntimeProperties.forEach(function (sPropertyKey) {
					oNestedMetadata[sPropertyKey] = deepClone(oValue[sPropertyKey]);
				});
				oNewDesigntimeMetadata[oValue.key] = { __value: oNestedMetadata };

				return _omit(oValue, aDesigntimeProperties);
			});

			var oNextValue = this._processOutputValue(aValues);

			// Remove renamed keys from designtime
			aPreviousValues.forEach(function (oPreviousValue) {
				var sOldKey = oPreviousValue.key;
				if (sOldKey !== undefined && !oNextValue.hasOwnProperty(sOldKey)) {
					oNewDesigntimeMetadata[sOldKey] = null;
				}
			});

			this.setValue(oNextValue);
			this.setDesigntimeMetadata(_merge(
				{},
				this.getConfig().designtime,
				oNewDesigntimeMetadata
			));
		}, this);
	};

	ComplexMapEditor.prototype._processInputValue = function (oValue) {
		var aDesigntimeProperties = this.getDesigntimeProperties();
		if (!oValue) {
			oValue = {};
		}
		var aFormattedValues = Object.keys(oValue).map(function (sKey) {
			var oFormattedValue = deepClone(oValue[sKey]);

			oFormattedValue.key = sKey;

			var oDesigntimeMetadata = this.getNestedDesigntimeMetadataValue(sKey);
			// Only write the explicitly defined designtime properties into the value
			// because they have to be cleaned up on value change later
			aDesigntimeProperties.forEach(function (sProperty) {
				oFormattedValue[sProperty] = oDesigntimeMetadata[sProperty];
			});

			return oFormattedValue;
		}.bind(this));

		//handle card filters input data
		if (this.getConfig().type === "filters") {
			for (var i = 0; i < aFormattedValues.length; i++) {
				if (!aFormattedValues[i].options) {
					var oDefaultOptions = this._getDefaultFilterOptions();
					aFormattedValues[i].options = oDefaultOptions;
				}
				if (aFormattedValues[i].type === undefined) {
					aFormattedValues[i].selectedOptions = [];
				}
				if (aFormattedValues[i].type === "Select") {
					aFormattedValues[i].sValue = aFormattedValues[i].value;
					delete aFormattedValues[i].value;
					aFormattedValues[i].selectedOptions = [];
				} else if (aFormattedValues[i].type === "DateRange") {
					// aFormattedValues[i].dValue = aFormattedValues[i].value;
					// delete aFormattedValues[i].value;
					//add required properties for new filter
					if (!aFormattedValues[i].value) {
						aFormattedValues[i].value = {option: 'today', values: []};
					}
					aFormattedValues[i].dValue = aFormattedValues[i].value;
					delete aFormattedValues[i].value;
					//construct values for selected date range option
					var oSelectedOptions = [];
					for (var j = 0; j < aFormattedValues[i].options.length; j++) {
						oSelectedOptions.push({
							key: aFormattedValues[i].options[j],
							title: aFormattedValues[i].options[j]
						});
					}
					aFormattedValues[i].selectedOptions = oSelectedOptions;
				} else if (aFormattedValues[i].type === "Search") {
					delete aFormattedValues[i].options;
					delete aFormattedValues[i].selectedOptions;
					aFormattedValues[i].sValue = aFormattedValues[i].value;
					delete aFormattedValues[i].value;
				}
			}
		}

		return aFormattedValues;
	};

	ComplexMapEditor.prototype.getDesigntimeProperties = function () {
		return [];
	};

	ComplexMapEditor.prototype.onBeforeConfigChange = function (oConfig) {
		var oTemplate = {};

		if (oConfig["allowKeyChange"]) {
			// Developer scenario

			oTemplate = {
				key: {
					label: oConfig["keyLabel"],
					type: "string",
					path: "key",
					validators: {
						uniqueKey: {
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
					}
				}
			};
		}

		var oArrayConfig = _merge(
			{},
			{
				template: oTemplate,
				allowSorting: false
			},
			oConfig,
			{
				type: "array",
				path: "" // Avoid registration on BaseEditor
			}
		);

		this._oDefaultModel.setData(
			Object.assign({}, this._oDefaultModel.getData(), {
				nestedConfig: oArrayConfig
			})
		);

		return oConfig;
	};

	ComplexMapEditor.prototype.setValue = function (oValue) {
		var oFormattedValue = this._processInputValue(oValue);

		this._oDefaultModel.setData(
			Object.assign({}, this._oDefaultModel.getData(), {
				nestedValue: oFormattedValue
			})
		);

		BasePropertyEditor.prototype.setValue.call(this, oValue);
	};

	ComplexMapEditor.prototype._processOutputValue = function(aValue) {
		//handle filters value path conflict issue
		if (this.getConfig().type === "filters") {
			for (var i = 0; i < aValue.length; i++) {
				if (aValue[i].type === "Select") {
					aValue[i].value = aValue[i].sValue;
					delete aValue[i].sValue;
				} else if (aValue[i].type === "DateRange" && aValue[i].selectedOptions) {
					aValue[i].value = aValue[i].dValue;
					delete aValue[i].dValue;
					delete aValue[i].selectedOptions;
				} else if (aValue[i].type === "Search") {
					aValue[i].value = aValue[i].sValue;
					delete aValue[i].sValue;
					delete aValue[i].dValue;
				}
			}
		}
		var oFormattedValue = {};
		aValue.forEach(function (oValue) {
			oFormattedValue[oValue.key] = _omit(oValue, "key");
		});
		return oFormattedValue;
	};

	ComplexMapEditor.prototype._getDefaultFilterOptions = function() {
		var dateRangeFilter = new DateRangeFilter();
		var oDefaultFilterOptions = dateRangeFilter._getDefaultOptions();
		return oDefaultFilterOptions;
	};

	return ComplexMapEditor;
});