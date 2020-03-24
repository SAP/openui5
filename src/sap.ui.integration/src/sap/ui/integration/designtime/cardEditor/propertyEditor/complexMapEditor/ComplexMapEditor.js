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
	 * 	<td>Whether to allow editing the key attribute of map entries</td>
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

	ComplexMapEditor.prototype.asyncInit = function () {
		this._oNestedArrayEditor = this.getContent();

		this._oNestedArrayEditor.attachValueChange(function (oEvent) {
			var aPreviousValue = oEvent.getParameter("previousValue") || [];
			var aValue = deepClone(oEvent.getParameter("value") || []);

			var aInvalidItems = aValue.map(function (oValue, iIndex) {
				if (typeof oValue.key === "undefined") {
					var sKey = "key";
					var iNextIndex = 0;
					var fnCheckDuplicateKey = function (oExistingValue) {
						return oExistingValue.key === sKey;
					};
					while (aValue.some(fnCheckDuplicateKey)) {
						sKey = "key" + ++iNextIndex;
					}
					oValue.key = sKey;
				}

				var bIsDuplicateKey = (
					(!aPreviousValue[iIndex] || oValue.key !== aPreviousValue[iIndex].key) && // Entry is new or key changed
					aValue.some(function (oValueToCompare, iIndexToCompare) { // Key already exists
						return oValueToCompare.key === oValue.key && iIndexToCompare !== iIndex;
					})
				);
				this._setInputState(iIndex, bIsDuplicateKey, this.getI18nProperty("BASE_EDITOR.MAP.DUPLICATE_KEY"));
				return bIsDuplicateKey;
			}, this).filter(Boolean);

			if (!aInvalidItems.length) {
				this.setValue(this._formatOutputValue(aValue));
			}
		}, this);
	};

	ComplexMapEditor.prototype._formatInputValue = function (oValue) {
		if (!oValue) {
			oValue = {};
		}
		var aFormattedValues = Object.keys(oValue).map(function (sKey) {
			var oFormattedValue = deepClone(oValue[sKey]);
			oFormattedValue.key = sKey;
			return oFormattedValue;
		});
		return aFormattedValues;
	};

	ComplexMapEditor.prototype.setConfig = function (oConfig) {
		var oArrayConfig = _merge({}, {
			template: {
				key: {
					label: oConfig["keyLabel"] || this.getI18nProperty("CARD_EDITOR.COMPLEX_MAP.KEY"),
					type: "string",
					path: "key",
					enabled: oConfig["allowKeyChange"] !== false
				}
			},
			allowSorting: false
		}, oConfig);
		oArrayConfig.type = "array";

		// Avoid registration on BaseEditor
		oArrayConfig.path = "";

		this._oNestedArrayEditor.setConfig(oArrayConfig);
		BasePropertyEditor.prototype.setConfig.call(this, oConfig);
	};

	ComplexMapEditor.prototype._setInputState = function (iIndex, bHasError, sError) {
		// Open task: Introduce an API for setting errors on editors to avoid use of private attributes in this function

		var oComplexMapItem = this._oNestedArrayEditor.getAggregation("propertyEditor");
		if (!oComplexMapItem || !oComplexMapItem._aEditorWrappers[iIndex]) {
			return;
		}
		var oKeyInput = oComplexMapItem._aEditorWrappers[iIndex].getAggregation("propertyEditors")[0].getContent();

		if (bHasError) {
			oKeyInput.setValueState("Error");
			oKeyInput.setValueStateText(sError);
		} else {
			oKeyInput.setValueState("None");
		}
	};

	ComplexMapEditor.prototype.setValue = function (oValue) {
		var oFormattedValue = this._formatInputValue(oValue);
		this._oNestedArrayEditor.setValue(oFormattedValue);
		BasePropertyEditor.prototype.setValue.call(this, oValue);
	};

	ComplexMapEditor.prototype._formatOutputValue = function(aValue) {
		var oFormattedValue = {};
		aValue.forEach(function (oValue) {
			oFormattedValue[oValue.key] = _omit(oValue, "key");
		});
		return oFormattedValue;
	};

	return ComplexMapEditor;
});