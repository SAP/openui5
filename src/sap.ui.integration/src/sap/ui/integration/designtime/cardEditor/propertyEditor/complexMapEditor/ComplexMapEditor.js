/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_merge",
	"sap/base/util/deepClone"
], function (
	BasePropertyEditor,
	_omit,
	_merge,
	deepClone
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

			this.setDesigntimeMetadata(_merge(
				{},
				this.getConfig().designtime,
				oNewDesigntimeMetadata
			));
			this.setValue(oNextValue);
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

		if (this.isReady()) {
			this._oNestedArrayEditor.setConfig(oArrayConfig);
		} else {
			this.ready().then(function (oArrayConfig) {
				this._oNestedArrayEditor.setConfig(oArrayConfig);
			}.bind(this, oArrayConfig));
		}

		return oConfig;
	};

	ComplexMapEditor.prototype.setValue = function (oValue) {
		var oFormattedValue = this._processInputValue(oValue);

		if (this.isReady()) {
			this._oNestedArrayEditor.setValue(oFormattedValue);
		} else {
			this.ready().then(function (oFormattedValue) {
				this._oNestedArrayEditor.setValue(oFormattedValue);
			}.bind(this, oFormattedValue));
		}

		BasePropertyEditor.prototype.setValue.call(this, oValue);
	};

	ComplexMapEditor.prototype._processOutputValue = function(aValue) {
		var oFormattedValue = {};
		aValue.forEach(function (oValue) {
			oFormattedValue[oValue.key] = _omit(oValue, "key");
		});
		return oFormattedValue;
	};

	return ComplexMapEditor;
});